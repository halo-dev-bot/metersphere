export const FUNC_TEMPLATE = {
  beanshell: "",
  groovy: "",
  python: "",
  javascript: ""
}

export function getCodeTemplate(language, requestObj) {
  switch (language) {
    case "groovy":
      return groovyCode(requestObj);
    case "python":
      return pythonCode(requestObj);
    case "beanshell":
      return javaCode(requestObj);
    case "nashornScript":
      return jsCode(requestObj);
    case "rhinoScript":
      return jsCode(requestObj);
    case "javascript":
      return jsCode(requestObj);
    default:
      return "";
  }
}

function groovyCode(requestObj) {
  let {
    requestHeaders = new Map(), requestBody = "", requestPath = "",
    requestMethod = "", host = "", protocol = "", requestArguments = new Map(), requestRest = new Map()
  } = requestObj;
  let requestUrl = "";
  requestPath = getRequestPath(requestArguments, requestPath);
  requestPath = replaceRestParams(requestPath, requestRest);
  if (protocol && host && requestPath) {
    requestUrl = protocol + "://" + host + requestPath;
  }
  let body = JSON.stringify(requestBody);
  let headers = getHeaders(requestHeaders);
  let obj = {requestUrl, requestMethod, headers, body};
  return _groovyCodeTemplate(obj);
}

function pythonCode(requestObj) {
  let {
    requestHeaders = new Map(),
    requestBody = "",
    requestPath = "/",
    requestMethod = "",
    host = "",
    protocol = "http",
    requestArguments = new Map(),
    requestBodyKvs = new Map(),
    bodyType,
    requestRest = new Map()
  } = requestObj;
  let connType = "HTTPConnection";
  if (protocol === 'https') {
    connType = "HTTPSConnection";
  }
  let headers = getHeaders(requestHeaders);
  requestBody = requestBody ? JSON.stringify(requestBody) : "{}";
  requestPath = getRequestPath(requestArguments, requestPath);
  requestPath = replaceRestParams(requestPath, requestRest);
  let obj = {requestBody, headers, host, requestPath, requestMethod, requestBodyKvs, bodyType, connType};
  return _pythonCodeTemplate(obj);
}

function javaCode(requestObj) {
  return _beanshellTemplate(requestObj);
}

function jsCode(requestObj) {
  return _jsTemplate(requestObj);
}

function getRequestPath(requestArgs, requestPath) {
  if (requestArgs.size > 0) {
    requestPath = requestPath + "?"
    let index = 1;
    for (let [k, v] of requestArgs) {
      if (index !== 1) {
        requestPath = requestPath + "&";
      }
      requestPath = requestPath + k + "=" + v;
      index++;
    }
  }
  return requestPath;
}

function getHeaders(requestHeaders) {
  let headers = "{";
  let index = 1;
  for (let [k, v] of requestHeaders) {
    if (index !== 1) {
      headers += ",";
    }
    // 拼装
    headers += `'${k}':'${v}'`;
    index++;
  }
  headers = headers + "}"
  return headers;
}

function _pythonCodeTemplate(obj) {
  let {requestBody, requestBodyKvs, bodyType, headers, host, requestPath, requestMethod, connType} = obj;
  let reqBody = obj.requestBody;
  if (obj.bodyType !== 'json' && obj.requestBodyKvs) {
    reqBody = 'urllib.urlencode({';
    // 设置post参数
    for (let [k, v] of requestBodyKvs) {
      reqBody += `\'${k}\':\'${v}\'`;
    }
    reqBody += `})`;
  }

  return `import httplib,urllib
params = ${reqBody} #例 {'username':'test'}
headers = ${headers} #例 {'Content-Type':'application/json'} 或 {'Content-type': 'application/x-www-form-urlencoded', 'Accept': 'text/plain'}
host = '${host}'
path = '${requestPath}'
method = '${requestMethod}' # POST/GET

conn = httplib.${connType}(host)
conn.request(method, path, params, headers)
res = conn.getresponse()
data = unicode(res.read(), 'utf-8')
log.info(data)
`;
}

function _groovyCodeTemplate(obj) {
  let {requestUrl, requestMethod, headers, body} = obj;
  let params = `[
                'url': '${requestUrl}',
                'method': '${requestMethod}', // POST/GET
                'headers': ${headers}, // 请求headers 例：{'Content-type':'application/json'}
                'data': ${body} // 参数
                ]`
  return `import groovy.json.JsonOutput
import groovy.json.JsonSlurper

def params = ${params}
def headers = params['headers']
// json数据
def data = params['data']
def conn = new URL(params['url']).openConnection()
conn.setRequestMethod(params['method'])
if (data) {
    headers.each {
      k,v -> conn.setRequestProperty(k, v);
    }
    // 输出请求参数
    log.info(data)
    conn.doOutput = true
    def writer = new OutputStreamWriter(conn.outputStream)
    writer.write(data)
    writer.flush()
    writer.close()
}
log.info(conn.content.text)
`;
}

function _beanshellTemplate(obj) {
  let {
    requestHeaders = new Map(),
    requestBody = "",
    requestBodyKvs = new Map(),
    bodyType = "",
    requestPath = "/",
    requestMethod = "GET",
    protocol = "http",
    requestArguments = new Map(),
    domain = "",
    port = "",
    requestRest = new Map()
  } = obj;

  requestPath = replaceRestParams(requestPath, requestRest);
  let uri = `new URIBuilder()
                .setScheme("${protocol}")
                .setHost("${domain}")
                .setPath("${requestPath}")
                `;
  // http 请求类型
  let method = requestMethod.toLowerCase().replace(/^\S/, s => s.toUpperCase());
  let httpMethodCode = `Http${method} request = new Http${method}(uri);`;
  // 设置参数
  for (let [k, v] of requestArguments) {
    uri = uri + `.setParameter("${k}", "${v}")`;
  }


  let postKvsParam = "";
  if (method === 'Post') {
    // 设置post参数
    for (let [k, v] of requestBodyKvs) {
      postKvsParam += `
    nameValueList.add(new BasicNameValuePair("${k}", "${v}"));\r\n`;
    }
    if (postKvsParam !== "") {
      postKvsParam = `
    List nameValueList = new ArrayList();\r\n` + postKvsParam;
    }
  }

  if (port) {
    uri += `.setPort(${port}) // int类型端口
    `;
    uri += `            .build();`;
  } else {
    uri += `// .setPort(${port}) // int类型端口
    `;
    uri += `            .build();`;
  }
  // 设置请求头
  let setHeader = "";
  for (let [k, v] of requestHeaders) {
    setHeader = setHeader + `request.setHeader("${k}", "${v}");` + '\n';
  }
  try {
    requestBody = JSON.stringify(requestBody);
  } catch (e) {
    requestBody = "";
  }
  let postMethodCode = "";
  if (requestMethod === "POST") {
    if (bodyType === "json") {
      postMethodCode = `
    request.setEntity(new StringEntity(StringEscapeUtils.unescapeJava(payload)));
    `;
    } else {
      postMethodCode = postKvsParam + "\r\n" + `
    request.setEntity(new UrlEncodedFormEntity(nameValueList, "UTF-8"));
    `;
    }
  }

  return `import java.net.URI;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.*;
import org.apache.commons.text.StringEscapeUtils;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.http.entity.StringEntity;

import java.util. *;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;

// 创建Httpclient对象
CloseableHttpClient httpclient = HttpClients.createDefault();
// 参数
String payload = ${requestBody};
// 定义请求的参数
URI uri = ${uri}
// 创建http请求
${httpMethodCode}
${setHeader}
${postMethodCode}
log.info(uri.toString());
//response 对象
CloseableHttpResponse response = null;

response = httpclient.execute(request);
// 判断返回状态是否为200
if (response.getStatusLine().getStatusCode() == 200) {
    String content = EntityUtils.toString(response.getEntity(), "UTF-8");
    log.info(content);
}`
}

function _jsTemplate(obj) {
  let {
    requestHeaders = new Map(),
    requestBody = "",
    requestPath = "/",
    requestMethod = "GET",
    protocol = "http",
    requestArguments = new Map(),
    domain = "",
    port = "",
    requestRest = new Map()
  } = obj;
  let url = "";
  requestPath = replaceRestParams(requestPath, requestRest);
  if (protocol && domain && port) {
    url = protocol + "://" + domain + ":" + port + requestPath;
  }
  url = getRequestPath(requestArguments, url);
  try {
    requestBody = JSON.stringify(requestBody);
  } catch (e) {
    requestBody = "";
  }

  let connStr = "";
  for (let [k, v] of requestHeaders) {
    connStr += `conn.setRequestProperty("${k}","${v}");` + '\n';
  }

  return `var urlStr = "${url}"; // 请求地址
var requestMethod = "${requestMethod}"; // 请求类型
var parameterData = ${requestBody}; // 请求参数
var url = new java.net.URL(urlStr);
var conn = url.openConnection();
conn.setRequestMethod(requestMethod);
conn.setDoOutput(true);
${connStr}conn.connect();
var opt = new java.io.DataOutputStream(conn.getOutputStream());
var t = (new java.lang.String(parameterData)).getBytes("utf-8");
opt.write(t);
opt.flush();
opt.close();
var ipt = conn.getInputStream();
var reader = new java.io.BufferedReader(new java.io.InputStreamReader(ipt, "UTF-8"));
var lines;
var res = "";
while((lines = reader.readLine()) !== null) {
  res += lines;
}
log.info(res);
  `;
}

function replaceRestParams(path, restMap) {
  if (!path) {
    return path;
  }
  let arr = path.match(/{([\w]+)}/g);
  if (Array.isArray(arr) && arr.length > 0) {
    arr = Array.from(new Set(arr));
    for (let str of arr) {
      try {
        let temp = str.substr(1);
        let param = temp.substring(0, temp.length - 1);
        if (str && restMap.has(param)) {
          path = path.replace(new RegExp(str, 'g'), restMap.get(param));
        }
      } catch (e) {
        // nothing
      }
    }
  }
  return path;
}

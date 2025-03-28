package io.metersphere.base.mapper.ext;

import io.metersphere.base.domain.TestCase;
import io.metersphere.base.domain.TestCaseWithBLOBs;
import io.metersphere.controller.request.BaseQueryRequest;
import io.metersphere.dto.RelationshipGraphData;
import io.metersphere.track.dto.CustomFieldResourceCompatibleDTO;
import io.metersphere.track.dto.TestCaseDTO;
import io.metersphere.track.request.testcase.DeleteTestCaseRequest;
import io.metersphere.track.request.testcase.QueryTestCaseRequest;
import io.metersphere.track.request.testcase.TestCaseBatchRequest;
import io.metersphere.track.response.TrackCountResult;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface ExtTestCaseMapper {

    List<TestCase> getTestCaseNames(@Param("request") QueryTestCaseRequest request);

    List<TestCaseDTO> list(@Param("request") QueryTestCaseRequest request);

    List<TestCaseDTO> publicList(@Param("request") QueryTestCaseRequest request);

    int moduleCount(@Param("request") QueryTestCaseRequest request);

    List<TestCaseDTO> listByMethod(@Param("request") QueryTestCaseRequest request);

    List<TestCaseDTO> listByTestCaseIds(@Param("request") TestCaseBatchRequest request);

    TestCase getMaxNumByProjectId(@Param("projectId") String projectId);

    /**
     * 获取不在测试计划中的用例
     *
     * @param request
     * @return
     */
    List<TestCaseDTO> getTestCaseByNotInPlan(@Param("request") QueryTestCaseRequest request);

    /**
     * 获取不在测试缺陷中的用例
     *
     * @param request
     * @return
     */
    List<TestCaseDTO> getTestCaseByNotInIssue(@Param("request") QueryTestCaseRequest request);

    /**
     * 获取不在评审范围中的用例
     *
     * @param request
     * @return
     */
    List<TestCaseDTO> getTestCaseByNotInReview(@Param("request") QueryTestCaseRequest request);

    /**
     * 检查某工作空间下是否有某用例
     *
     * @param caseId
     * @param projectIds
     * @return TestCase ID
     */
    int checkIsHave(@Param("caseId") String caseId, @Param("projectIds") Set<String> projectIds);

    List<String> selectIds(@Param("request") BaseQueryRequest condition);

    List<String> selectPublicIds(@Param("request") BaseQueryRequest condition);

    /**
     * 按照用例等级统计
     *
     * @param projectId 项目ID
     * @return 统计结果
     */
    List<TrackCountResult> countPriority(@Param("projectId") String projectId);

    long countCreatedThisWeek(@Param("projectId") String projectId, @Param("firstDayTimestamp") long firstDayTimestamp, @Param("lastDayTimestamp") long lastDayTimestamp);

    List<TrackCountResult> countStatus(@Param("projectId") String projectId);

    List<TrackCountResult> countRelevance(@Param("projectId") String projectId);

    long countRelevanceCreatedThisWeek(@Param("projectId") String projectId, @Param("firstDayTimestamp") long firstDayTimestamp, @Param("lastDayTimestamp") long lastDayTimestamp);

    int countCoverage(@Param("projectId") String projectId);

    List<TrackCountResult> countFuncMaintainer(@Param("projectId") String projectId);

    List<TrackCountResult> countRelevanceMaintainer(@Param("projectId") String projectId);

    int getTestPlanBug(@Param("planId") String planId);

    int getTestPlanCase(@Param("planId") String planId);

    int getTestPlanPassCase(@Param("planId") String planId);


    List<TestCaseDTO> listForMinder(@Param("request") QueryTestCaseRequest request);

    List<TestCaseDTO> getTestCaseByIds(@Param("ids") List<String> ids);

    void updateTestCaseCustomNumByProjectId(@Param("projectId") String projectId);

    List<String> selectRelateIdsByQuery(@Param("request") BaseQueryRequest query);

    List<Map<String, Object>> moduleCountByCollection(@Param("request") QueryTestCaseRequest request);

    List<TestCaseWithBLOBs> getCustomFieldsByIds(@Param("ids") List<String> ids);

    int deleteToGc(@Param("request") DeleteTestCaseRequest testCase);

    int deletePublic(@Param("request") TestCase testCase);

    int reduction(@Param("ids") List<String> ids);

    void checkOriginalStatusByIds(@Param("ids") List<String> ids);

    List<String> selectIdsByNodeIds(@Param("ids") List<String> nodeIds);

    TestCaseWithBLOBs getTestCaseStep(@Param("id") String id);

    List<String> selectProjectIds();

    List<String> getIdsOrderByUpdateTime(@Param("projectId") String projectId);

    Long getLastOrder(@Param("projectId") String projectId, @Param("baseOrder") Long baseOrder);

    Long getPreOrder(@Param("projectId") String projectId, @Param("baseOrder") Long baseOrder);

    List<TestCaseDTO> getTestCase(@Param("request") QueryTestCaseRequest request);

    List<RelationshipGraphData.Node> getTestCaseForGraph(@Param("ids") Set<String> ids);

    int countByIds(@Param("ids") List<String> ids);

    String getLastExecStatusById(String id);

    List<TestCaseDTO> getLastExecStatusByIdList(@Param("ids") List<String> idList);

    int countByWorkSpaceId(String workSpaceId);

    long trashCount(@Param("projectId") String projectId);

    List<String> selectRefIdsForVersionChange(@Param("versionId") String versionId, @Param("projectId") String projectId);

    int addLatestVersion(@Param("refId") String refId);

    List<TestCase> getMaintainerMap(@Param("request") QueryTestCaseRequest request);

    List<TestCaseDTO> getForNodeEdit(@Param("ids") List<String> ids);

    List<CustomFieldResourceCompatibleDTO> getForCompatibleCustomField(String projectId, int offset, int pageSize);

    List<Map<String, Object>> moduleExtraNodeCount(@Param("nodeIds") List<String> nodeIds);
}

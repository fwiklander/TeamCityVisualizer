import tornado.web
import json
import configuration
import TeamCityRequests as tcRequest


class ProjectHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, project_id):
        project = get_project(project_id)
        self.write(project['payload_json'])


class CurrentBuildChainHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, project_id):
        project_info = get_project(project_id)['payload_json']
        result = dict(
            projectId=project_id,
            buildStageCount=project_info['buildTypes']['count'],
            buildStages=[])
            
        build_queue = []
        
        for build_type_index in range(0, result['buildStageCount']):
            tc_build_type = project_info['buildTypes']['buildType'][build_type_index]
            buildType = dict(
                id=tc_build_type['id'],
                name=tc_build_type['name'],
                webUrl=tc_build_type['webUrl'],
                lastBuild=get_build_info(tc_build_type['id']),
                pendingBuilds=get_pending_builds(build_queue, tc_build_type['id']))

            result['buildStages'].append(buildType)

        self.write(result)


class ProjectHistoryHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, project_id, history_length):
        result = get_project(project_id)

        build_type_count = result['payload_json']['buildTypes']['count']
        build_types = result['payload_json']['buildTypes']['buildType']
        # history_first_configuration = configuration.get_builds(buildTypes[0]['id'])

        for x in range(0, build_type_count):
            pass

        history = dict(history=build_types)
        self.write(history)


def get_pending_builds(build_queue, build_type_id):
    return dict(count=0)
        
        
def get_build_info(build_type_id):
    tc_builds = configuration.get_builds(build_type_id)['payload_json'].get('build')
    if tc_builds is None:
        return dict()
        
    tc_build = tc_builds[0]
    build = dict(
        id=tc_build['id'],
        version=tc_build.get('number'),
        status=tc_build.get('status'),
        webUrl=tc_build['webUrl'],
        state=tc_build['state'],
        running=False)
    
    if tc_build.get('running') is not None:
        build['running']=tc_build['running']

    return build


def get_project(project_id):
    uri = '/app/rest/projects/id:' + project_id
    projects = tcRequest.make_request(uri)
    if False:
        payload = projects['payload_json']
        for project in payload['project']:
            if project['id'] == '_Root':
                payload['project'].remove(project)
                break

    return projects

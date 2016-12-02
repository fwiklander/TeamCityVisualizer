import tornado.web
import json
import configuration
import build
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


class LastCompleteBuildChainHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, project_id):
        result = get_project(project_id)['payload_json']
        last_build_type = result['buildTypes']['buildType'][result['buildTypes']['count'] - 1]
        builds_for_last = configuration.get_builds(last_build_type['id'])['payload_json']
        for build_info in builds_for_last['build']:
            if build_info['status'] == 'SUCCESS':
                build_chain = build.get_build_chain_to(build_info['id'])['payload_json']
                chain_completed = True
                for c in range(build_chain['count']):
                    if build_chain['build'][c]['status'] != 'SUCCESS':
                        chain_completed = False
                        break
                
                if chain_completed:
                    break
        
        completed_chain = dict(
                            version=build_chain['build'][0]['number'],
                            buildTypeCount=build_chain['count'],
                            chain=[])

        for chain_item in build_chain['build']:
            completed_chain['chain'].append(dict(
                id=chain_item['id'],
                webUrl=chain_item['webUrl'],
                status=chain_item['status'],
                buildTypeId=chain_item['buildTypeId']))
        
        self.write(completed_chain)


class ProjectHistoryHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, project_id, history_length):
        history_length = int(history_length)
        result = get_project(project_id)

        build_type_count = result['payload_json']['buildTypes']['count']
        if build_type_count == 0:
            self.write('ajaj')
            return
        
        first_build_type = result['payload_json']['buildTypes']['buildType'][0]
        history_length = min(history_length, build_type_count)

        history = dict(
                    historyCount=history_length,
                    history=[])

        # Get builds for first build type
        # Get chain for n number of builds

        builds_for_configuration = configuration.get_builds(first_build_type['id'])['payload_json']
        for build_info in builds_for_configuration['build']:
            if build_info['number'] == 'N/A':
                continue

            build_chain = build.get_build_chain_from(build_info['id'])['payload_json']['build']
            build_chain_history = []
            for build_chain_info in build_chain:
                build_chain_add = dict(
                                    id=build_chain_info['id'],
                                    buildStageId=build_chain_info['buildTypeId'],
                                    status=build_chain_info['status'],
                                    state=build_chain_info['state'],
                                    webUrl=build_chain_info['webUrl'])

                build_chain_history.append(build_chain_add)

            history['history'].append(dict(
                                        chainCount=len(build_chain_history),
                                        version=build_chain_info['number'],
                                        buildChain=build_chain_history))

            if len(history['history']) >= history_length:
                break

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


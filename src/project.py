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
            build_info = get_build_info(tc_build_type['id'])
            buildType = dict(
                id=tc_build_type['id'],
                name=tc_build_type['name'],
                webUrl=tc_build_type['webUrl'],
                lastBuild=build_info['build'],
                pendingBuilds=build_info['pendingCount'])

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
                buildStageId=chain_item['buildTypeId']))
        
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

        builds_for_configuration = configuration.get_builds(first_build_type['id'], False)['payload_json']
        for build_info in builds_for_configuration['build']:
            if build_info['number'] == 'N/A':
                continue

            build_chain = build.get_build_chain_from(build_info['id'])['payload_json']['build']
            build_chain_history = []
            for build_chain_info in build_chain:
                build_chain_add = dict(
                                    id=build_chain_info['id'],
                                    buildStageId=build_chain_info['buildTypeId'],
                                    status=build_chain_info.get('status'),
                                    state=build_chain_info['state'],
                                    running=build_chain_info.get('running', False),
                                    webUrl=build_chain_info['webUrl'])

                build_chain_history.append(build_chain_add)

            history['history'].append(dict(
                                        chainCount=len(build_chain_history),
                                        version=build_chain_info['number'],
                                        buildChain=build_chain_history))

            if len(history['history']) >= history_length:
                break

        self.write(history)


class PromoteBuildHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        pass

    def get(self, project_id, dependency_build_id):
        project_info = get_project(project_id)['payload_json']
        dependency_build_id = int(dependency_build_id)
        build_type_id = ''
        currentIndex = 0
        dependency_build = build.get_build(dependency_build_id)['payload_json']
        for build_type in project_info['buildTypes']['buildType']:
            if build_type['id'] == dependency_build['buildTypeId']:
                build_type_id = project_info['buildTypes']['buildType'][currentIndex + 1]['id']
                break
            currentIndex += 1

        # get dependent builds
        dependency_build_types = get_dependency_build_types(build_type_id)
        print ('dependency build types: ', dict(types=dependency_build_types))
        print ('version to check: ', dependency_build['number'])
        # Sök upp lämpliga byggen för varje dependency för att använda till triggning
        dependency_build_ids = []
        for dependency_id in dependency_build_types:
            dependency_build_ids.append(get_build_id_for_version(dependency_id, dependency_build['number']))
            
        print ('dependency build ids: ', dict(ids=dependency_build_ids))

        # Skapa och skicka post till TC typ som idag
        result = tcRequest.start_build(build_type_id, dependency_build_ids)
        resp = dict(
                    projectId=project_id,
                    dependencyBuildId=dependency_build_id,
                    configurationId=build_type_id)

        self.write(result.content)


def get_build_id_for_version(build_type_id, build_version):
    # get builds for configuration
    builds_for_configuration = configuration.get_builds(build_type_id)['payload_json']['build']
    
    # find last successful build
    builds_for_version = filter(lambda x: x['number'] == build_version, builds_for_configuration)
    
    successful_build = list(filter(lambda y: y['status'] == 'SUCCESS', builds_for_version))
    
    # return that
    return successful_build[0]['id']


def get_dependency_build_types(build_type_id):
    # Anrop mot TC för att hitta snapshot dependencies
    dependency_build_types = []
    build_stage_info = configuration.get_build_stage(build_type_id)['payload_json']
    for dependency in build_stage_info['snapshot-dependencies']['snapshot-dependency']:
        dependency_build_types.append(dependency['id'])
        # dependency_stage_build_id = configuration.get_builds(dependency_stage_id)
        # det här är inte ett bygge utan flera, se nästa kommentar pucko
        # dependency_build_types.append(dependency_stage_build_id)

    return dependency_build_types


def get_pending_builds(build_queue, build_type_id):
    return dict(count=0)
        
        
def get_build_info(build_type_id):
    tc_builds = configuration.get_builds(build_type_id)['payload_json'].get('build')
    if tc_builds is None:
        return dict()
    
    build_info = dict(pendingCount=0)
    for tc_build in tc_builds:
        if tc_build['state'] == 'queued':
            build_info['pendingCount'] += 1
        else:
            build_info['build'] = dict(
                id=tc_build['id'],
                version=tc_build.get('number'),
                status=tc_build.get('status'),
                webUrl=tc_build['webUrl'],
                state=tc_build['state'],
                running=tc_build.get('running', False))
            break

    return build_info


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


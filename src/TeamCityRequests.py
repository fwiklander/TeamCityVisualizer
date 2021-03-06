import requests

base_uri = ''


def start_build(config_id, dependency_build_ids):
    request_headers = get_default_request_headers()
    uri = base_uri + '/app/rest/buildQueue'
    build_ids = []
    for dependency_id in dependency_build_ids:
        build_ids.append(dict(id=int(dependency_id)))

    payload = {
        'personal': False,
        'buildType': {
            'id': config_id
        },
        'comment': {
            'text': 'Build triggered by Visualizer'
        },
        'snapshot-dependencies': {
            'count': 1,
            'build': build_ids
        }
    }
    
    # print ('Starting build for ' + config_id + ' build no. ' + dependency_build_id)
    response = requests.post(uri, json=payload)
    return response


def make_request(uri):
    request_headers = get_default_request_headers()

    response = requests.get(base_uri + uri, headers=request_headers)
    return dict(status_code=response.status_code, payload_json=response.json())


def get_default_request_headers():
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        }

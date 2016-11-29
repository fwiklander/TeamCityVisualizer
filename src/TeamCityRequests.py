import requests

base_uri = ''


def get_all_builds(url):
    request_headers = get_default_request_headers()
    url = url.replace(' ', '')
    response = requests.get(url, headers=request_headers)

    all_builds = response.json()
    return all_builds['build']
    

def start_build(config_id):
    request_headers = get_default_request_headers()
    uri = base_uri + 'app/rest/buildQueue'
    payload = {
        'personal': 'false',
        'buildType': {
            'id': config_id
        },
        'comment': {
            'text': 'Build triggered by Python backend'
        }
    }
    
    response = requests.post(uri, json=payload)


def get_build(uri, build_number):
    request_headers = get_default_request_headers()

    if not uri.endswith('/'):
        uri += '/'

    uri += 'id: ' + str(build_number)
    uri = uri.replace(" ", "")

    response = requests.get(base_uri + uri, headers=request_headers)
    return dict(status_code=response.status_code, payload_json=response.json())


def make_request(uri):
    request_headers = get_default_request_headers()

    response = requests.get(base_uri + uri, headers=request_headers)
    return dict(status_code=response.status_code, payload_json=response.json())


def get_default_request_headers():
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        }


import urllib.request, urllib.parse, re
from http.cookiejar import CookieJar

cj = CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
urllib.request.install_opener(opener)

html = opener.open('http://127.0.0.1:8000/login/').read().decode('utf-8')
csrf = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', html).group(1)
data = urllib.parse.urlencode({'csrfmiddlewaretoken': csrf, 'username': 'Zafira', 'password': 'zafira123', 'action': 'login'}).encode('utf-8')
try:
    opener.open('http://127.0.0.1:8000/login/', data)
except Exception as e:
    pass

index_html = opener.open('http://127.0.0.1:8000/index/').read().decode('utf-8')
print('Length:', len(index_html))
print(index_html[:1000])

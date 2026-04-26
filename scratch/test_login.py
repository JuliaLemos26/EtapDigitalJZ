import requests

def test():
    session = requests.Session()
    
    # Let's see what /pages/home/ returns WITHOUT login
    home_url = 'http://localhost:8000/pages/home/'
    r2 = session.get(home_url, allow_redirects=True)
    
    print("Response status:", r2.status_code)
    print("Response URL:", r2.url)
    print("Content length:", len(r2.text))
    if 'Login' in r2.text or 'Registe-se' in r2.text:
        print("YES, it returned the login page!")
    else:
        print("NO, it returned something else.")
        print(r2.text[:200])
    
if __name__ == '__main__':
    test()

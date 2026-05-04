import requests
import json




BASE_URL = 'http://localhost:5000/api'





def login(username, password):
    res = requests.post(f'{BASE_URL}/login', json={'username': username, 'password': password})



    if res.status_code == 200:
        return res.json()['access_token']
    else:
        print(f"Login Failed for {username}: {res.text}")
        return None





def main():
    



    print("--- 1. Login User ---")
    user_token = login('user1', '1234')
    if not user_token: return




    user_headers = {'Authorization': f'Bearer {user_token}'}
    
    



    print("--- 2. Check User Requests ---")
    res = requests.get(f'{BASE_URL}/talepler', headers=user_headers)
    talepler = res.json()
    print(f"User has {len(talepler)} requests.")
    
    if len(talepler) == 0:
        print("--- Creating Test Request ---")
        
        

        res = requests.get(f'{BASE_URL}/istasyonlar')
        istasyonlar = res.json()
        if not istasyonlar:
            print("CRITICAL: No stations found in DB!")
            return
        
        target_ist = istasyonlar[0]['id']


        requests.post(f'{BASE_URL}/talepler', headers=user_headers, json={
            'istasyon_id': target_ist,
            'kargo_sayisi': 5,
            'agirlik': 200,
            'aciklama': 'Debug Test Cargo'
        })


        print("Test cargo created.")




    
    print("\n--- 3. Login Admin ---")
    admin_token = login('admin', 'admin123')


    if not admin_token: return



    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    


    print("--- 4. Fetch All Requests (Admin) ---")
    res = requests.get(f'{BASE_URL}/talepler', headers=admin_headers)
    all_kargolar = res.json()
    print(f"Admin sees {len(all_kargolar)} total requests.")
    


    if len(all_kargolar) == 0:
        print("No cargo to plan. Aborting.")
        return



    print("--- 5. SOLVE (Unlimited) ---")
    payload = {'kargolar': all_kargolar}
    


    try:
        res = requests.post(f'{BASE_URL}/cozum/sinirsiz', headers=admin_headers, json=payload)
        print(f"Status Code: {res.status_code}")
        print("Response Body:")
        print(json.dumps(res.json(), indent=2))
    except Exception as e:
        print(f"Request Error: {e}")




if __name__ == '__main__':
    main()

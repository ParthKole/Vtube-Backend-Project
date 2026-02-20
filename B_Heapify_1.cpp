#include<iostream>
#include<vector>
using namespace std;


bool is_sorted(vector<int> v, int n){
    for(int i=1;i<n;i++){
        if(v[i]<v[i-1])
            return false;
    }
    return true;
}


int main(){
    int t;
    cin>>t;
    while(t--){
        int n;
        cin>>n;
        vector<int>v(n);
        for(int i=0;i<n;i++){
            cin>>v[i];
        }
       
            for(int i=0;i<=n/2;i++){
                int j=i;
                while((2*j+1<n) && v[j]>v[2*j+1] ){
                    swap(v[j],v[2*j+1]);
                    j=j/2;
                }
            }

            if(is_sorted(v,n))
            {
                cout<<"YES"<<endl;
            }
            else{
                cout<<"NO"<<endl;
            }
            
        
    }
}


#include<iostream>
#include<vector>
using namespace std;

int main(){
    int t;
    cin>>t;
    while(t--){
        int n;
        cin>>n;
        vector<int>v(n);
       bool sixtyseven=false;
        for(int i=0;i<n;i++){
            cin>>v[i];
               
            if(v[i]==67)
                sixtyseven=true;
        }

        if( sixtyseven){
            cout<<"YES"<<endl;
        }
        else{
            cout<<"NO"<<endl;
        }

    }
}
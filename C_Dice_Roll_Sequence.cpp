#include<iostream>
#include<vector>
using namespace std;




bool check(int a, int b){
    if(a+b==7||a==b) return 1;
    else return 0;
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

        int cnt=0;
        for(int i=0;i<n-1;i++){
            if(check(v[i],v[i+1])){
                i=i+1;
                cnt++;
            }
        }

        cout<<cnt<<endl;
        
    }
}




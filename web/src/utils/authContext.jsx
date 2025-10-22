import { createContext, useContext, useEffect, useReducer } from "react";

const initalState=null;

function authReducer(state,action){
    switch(action.type){
        case "LOGIN":
            return {
                userid:action.payload
            }
        case "LOGOUT":
            return null;
        default:
            return null;
    }
}

const AuthContext=createContext();

export default function AuthProvider({children}){
    const [auth,dispatch]=useReducer(authReducer,initalState,()=>{
        const saved=localStorage.getItem('user')
        return saved? JSON.parse(saved):initalState;
    })

    useEffect(()=>{
        localStorage.setItem('user',JSON.stringify(auth));
    },[auth])

    return(
        <AuthContext.Provider value={{auth,dispatch}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext);
}
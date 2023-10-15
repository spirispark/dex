import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { provider, tokens, exchange } from './reducers'

const reducer = combineReducers({
    provider, tokens, exchange
})

const initialState = {}
const middlleWare = [thunk]
const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middlleWare)))

export default store

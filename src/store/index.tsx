import React, {
    createContext,
    FC,
    useEffect,
    useMemo,
    useReducer,
} from 'react';
import { CHAIN_LIST_MAINNET } from '../utils/constants';
import { chooseAccount } from './methods/chooseAccount';
import { IChainList } from '../interface/ChainList';
// import checkChain from './methods/checkChain';

type ActionType = {
    type: string;
    payload: any;
};

interface IInitialState {
    chain?: IChainList;
    account?: any;
}

const initialState: IInitialState = {
    chain: CHAIN_LIST_MAINNET[0],
};

const reducer = (state = initialState, action: ActionType) => {
    switch (action.type) {
        case 'SET_CHAIN':
            return { ...state, chain: action.payload };
        case 'SET_ACCOUNT':
            return { ...state, account: action.payload };
        case 'SET_BALANCE':
            return { ...state, balance: action.payload };
        default:
            return state;
    }
};

const store = createContext<any>({
    state: initialState,
});

const { Provider } = store;

const StoreProvider: FC = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const setBalance = async (
        address: string,
        handleBalance: (address: string) => Promise<any>,
    ) => {
        const bal = await handleBalance(address);

        dispatch({
            type: 'SET_BALANCE',
            payload: bal.data.result[0],
        });
    };

    const setAccount = async (chain: IChainList) => {
        dispatch({ type: 'SET_CHAIN', payload: chain });

        const account = await chooseAccount(chain);

        dispatch({ type: 'SET_ACCOUNT', payload: account });

        localStorage.setItem('chain', JSON.stringify(chain));
    };

    useEffect(() => {
        const localStoreChain = localStorage.getItem('chain');
        if (typeof localStoreChain === 'string') {
            const localChain = JSON.parse(localStoreChain);
            setAccount(localChain);
        } else {
            setAccount(state.chain);
        }
    }, []);

    const provider = useMemo(() => {
        return {
            ...state,
            dispatch,
            setAccount,
            setBalance,
        };
    }, [state]);

    return <Provider value={provider}>{children}</Provider>;
};

export { store, StoreProvider };

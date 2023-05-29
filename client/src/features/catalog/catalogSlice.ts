import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { Product } from "../../app/models/product";
import { RootState } from "../../app/store/configureStore";

const productAdaptor = createEntityAdapter<Product>();

export const fetchProductsAsync = createAsyncThunk<Product[]>(
    'catalog/fetchProductsAsync', 
    async (_, thunkApi) => {
        try {
            return agent.Catalog.list();
        } catch (error: any) {
            return thunkApi.rejectWithValue({error: error.data})
        }
    }
);

export const fetchProductAsync = createAsyncThunk<Product, number>(
    'catalog/fetchProductAsync', 
    async (productId, thunkApi) => {
        try {
            return agent.Catalog.details(productId);
        } catch (error: any) {
            return thunkApi.rejectWithValue({error: error.data})
        }
    }
);

export const fetchFiltersAsync = createAsyncThunk(
    'catalog/fetchFilters',
    async (_, thunkApi) => {
        try {
            return agent.Catalog.fetchFilters();
        } catch (error: any) {
            return thunkApi.rejectWithValue({error: error.data})
        }
    }
)

export const catalogSlice = createSlice({
    name: 'catalog', 
    initialState: productAdaptor.getInitialState({
        productsLoaded: false,
        filtersLoaded: false,
        status: 'idle',
        brands: [],
        types: [],
    }),
    reducers: {},
    extraReducers: (builder => {
        builder.addCase(fetchProductsAsync.pending, (state) => {
            state.status = 'pendingFetchProducts';
        });
        builder.addCase(fetchProductsAsync.fulfilled, (state, action) => {
            productAdaptor.setAll(state, action.payload);
            state.status = 'idle';
            state.productsLoaded = true;
        });
        builder.addCase(fetchProductsAsync.rejected, (state, action) => {
            console.log(action.payload)
            state.status = 'idle';
        });
        builder.addCase(fetchProductAsync.pending, (state) => {
            state.status = 'pendingFetchProduct';
        });
        builder.addCase(fetchProductAsync.fulfilled, (state, action) => {
            productAdaptor.upsertOne(state, action.payload);
            state.status = 'idle';
        });
        builder.addCase(fetchProductAsync.rejected, (state, action) => {
            console.log(action);
            state.status = 'idle';
        });
        builder.addCase(fetchFiltersAsync.pending, (state) => {
            state.status = 'pendingFetchFilters';
        });
        builder.addCase(fetchFiltersAsync.fulfilled, (state, action) => {
            state.brands = action.payload.brands;
            state.types = action.payload.types;
            state.filtersLoaded = true;
            state.status ='idle';
        });
        builder.addCase(fetchFiltersAsync.rejected, (state, action) => {
            console.log(action.payload);
            state.status ='idle';
        });
    })
})

export const productSelectors = productAdaptor.getSelectors((state: RootState) => state.catalog);
// components/SearchBar.tsx
import React, { useState, useEffect } from 'react';
import { TextInput, View, ActivityIndicator } from 'react-native';
import { debounce } from 'lodash';
import { Ionicons } from '@expo/vector-icons';
type SearchBarProps<T> = {
    onSearch?: (query: string) => Promise<T[]>;
    onResults?: (results: T[]) => void;
    debounceDelay?: number;
    placeholder?: string;
};

export function SearchBar<T>({
    onSearch,
    onResults,
    debounceDelay = 300,
    placeholder = 'Search...',
}: SearchBarProps<T>) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const debouncedSearch = debounce(async (searchTerm: string) => {
     
        setLoading(true);
        if (!onSearch) {
            console.warn('onSearch function is not provided');
            setLoading(false);
            return;
        }
        try {
            const results = await onSearch(searchTerm);
            onResults?.(results);
        } finally {
            setLoading(false);
        }
    }, debounceDelay);

    useEffect(() => {
        debouncedSearch(query);
        return debouncedSearch.cancel;
    }, [query]);

    return (
        <View className="flex-row items-center px-4 py-1 bg-slate-100 rounded-xl shadow ">
            <Ionicons name="search" size={20} color="gray" className="mr-2" />
            <TextInput
                placeholder={placeholder}
                value={query}
                onChangeText={setQuery}
                className="flex-1 text-base text-slate-300 "
                placeholderTextColor={'gray'}
                textAlignVertical="top"
                style={{ paddingVertical: 8,color:'black' }}
            />
            {loading && <ActivityIndicator size="small" />}
        </View>
    );
}

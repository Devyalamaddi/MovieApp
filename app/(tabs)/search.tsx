import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { images } from '@/constants/images'
import MovieCard from '@/components/MovieCard'
import useFetch from '@/services/useFetch'
import { fetchMovies } from '@/services/api'
import { icons } from '@/constants/icons'
import SearchBar from '@/components/SearchBar'
import { updateSearchCount } from '@/services/appwrite'

const search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    data: movies = [], 
    loading: moviesLoading, 
    error: moviesError,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({
    query: searchQuery
  }), false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        await loadMovies();
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (movies && movies.length > 0 && movies?.[0]) {
      updateSearchCount(searchQuery, movies[0]);
     }
    },[searchQuery]);

  return (
    <View className='flex-1 bg-primary'>
      <Image
        source={images.bg} 
        className='flex-1 absolute w-full z-0' 
        resizeMode="cover"
      />
      <FlatList 
        data={movies || []}
        renderItem={({ item }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id?.toString() || 'default-key'}
        className='px-5'
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'center',
          gap: 16,
          marginVertical: 16
        }}
        contentContainerStyle={{
          paddingBottom: 100
        }}
        ListHeaderComponent={
          <>
            <View className='w-full flex-row justify-center'>
              <Image source={icons.logo} className='w-12 h-10 mb-5' />
            </View>
            <View className='my-5'>
              <SearchBar 
                placeholder='Search for a movie'
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>
            {moviesLoading && (
              <ActivityIndicator 
                size="large"
                color="#fff"
                className="my-3"
              />
            )}
            {moviesError && ( 
              <Text className='text-red-500 px-5 my-3'>
                Error: {moviesError?.message || 'Unknown error'}
              </Text>
            )}
            {!moviesLoading && !moviesError && searchQuery.trim() && movies?.length > 0 && (
              <Text className='text-lg text-white font-bold mt-5 mb-3'>
                Search Results for {' '}
                <Text className='text-blue-500'>{searchQuery}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !moviesLoading && !moviesError ? (
            <View className='mt-10 px-5'>
              <Text className='text-center text-gray-500'>
                {searchQuery.trim() ? 'No movies found' : 'Search for a movie'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

export default search
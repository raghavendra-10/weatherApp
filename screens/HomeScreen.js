import { View, Text, Image, TextInput, Touchable, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from 'lodash'
import { fetchLocation, fetchWeatherForecast } from '../api/weather'
import { weatherImages } from '../constants'
import { storeData, getData } from '../utils/asyncStorage'
import * as Location from 'expo-location';
import { Load } from '../components/loader'

export default function HomeScreen() {
    const [showSearch, toggleSearch] = React.useState(false)
    const [locations, setLocations] = React.useState([])
    const [weather, setWeather] = React.useState({})
    const [loading, setLoading] = React.useState(true)
    const handleLocation = (item) => {
        setLocations([])
        toggleSearch(false)
        setLoading(true);  // Set loading to true when a city is selected
    
        fetchWeatherForecast({ cityName: item.name, days: '7' }).then((data) => {
            setWeather(data)
          
            storeData('city', item.name)
            setLoading(false);  // Set loading to false once new weather data is fetched
        })
    }
    
    const handleSearch = (text) => {
        if (text.length > 2) {
            fetchLocation({ cityName: text }).then((data) => {
                setLocations(data)

            })
        }


    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchMyWeatherData();
            await getCurrentLocation();
            setLoading(false);  // Set loading to false once data fetching is complete
        }

        fetchData();
    }, [])

    const fetchMyWeatherData = async () => {
        let myCity = await getData('city')
        let cityName = 'Hyderabad'
        if (myCity) {
            cityName = myCity
        }
        fetchWeatherForecast({ cityName, days: '7' }).then((data) => {
            setWeather(data)
            console.log(data)
        })
    }
    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Fetch the location based on latitude and longitude
        fetchLocation({ latitude, longitude }).then((data) => {
            if (data && data.length > 0) {
                const currentCity = data[0].name;
                setLocations(data);
                fetchWeatherForecast({ cityName: currentCity, days: '7' }).then((weatherData) => {
                    setWeather(weatherData);
                });
            }
        });
    }


    const handleTextDebounce = useCallback(debounce(handleSearch, 700), [])

    const { current, location } = weather;
    return (
        <View style={{ flex: 1, position: 'relative' }}>
            <StatusBar style="light" />
            <Image blurRadius={30} source={require('../assets/bg.jpg')}
                style={{ position: 'absolute', height: '100%', width: '100%' }}
            />
            {loading ? <Load /> :
                <SafeAreaView style={{ display: 'flex', flex: 1 }}>
                    <View style={{ height: '7%', marginHorizontal: 20, position: 'relative', zIndex: 50 }}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderRadius: 9999, backgroundColor: showSearch ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
                            {showSearch ? (
                                <TextInput onChangeText={handleTextDebounce} placeholder='Search city' placeholderTextColor={'lightgray'} style={{ paddingLeft: 24, height: 40, display: 'flex', color: 'white', flex: 1 }} />
                            ) : null}

                            <TouchableOpacity onPress={() => toggleSearch(!showSearch)} style={{ borderRadius: 9999, padding: 12, margin: 1, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                                <MagnifyingGlassIcon size="25" color="white" />
                            </TouchableOpacity>
                        </View>
                        <View>
                            {
                                locations.length > 0 && showSearch ? (


                                    <View style={{ position: 'absolute', width: '100%', backgroundColor: '#D1D5DB', top: 20, borderRadius: 20 }}>
                                        {
                                            locations.map((item, index) => {
                                                let showBorder = index + 1 !== locations.length
                                                let borderClass = showBorder ? { borderBottomWidth: 1, borderColor: '#A1A1AA' } : {}
                                                return (
                                                    <TouchableOpacity onPress={() => handleLocation(item)} key={index} style={{ ...borderClass, padding: 12, paddingHorizontal: 12, marginBottom: 4, display: 'flex', flexDirection: 'row', gap: 10 }} >
                                                        <MapPinIcon size="20" color="gray" />
                                                        <Text style={{ color: 'black', fontSize: 15 }}>{item?.name}, {item?.country}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })
                                        }
                                    </View>
                                ) : null
                            }
                        </View>
                    </View>

                    <View style={{ display: 'flex', justifyContent: 'space-around', flex: 1, marginBottom: 5, padding: 6 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 500, fontSize: 20 }}>
                            {location?.name},
                            <Text style={{ fontSize: 15, color: '#D1D5DB' }}>
                                {" " + location?.country}
                            </Text>
                        </Text>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <Image source={weatherImages[current?.condition?.text]} style={{ width: 200, height: 200 }} />
                        </View>
                        <View>
                            <Text style={{ color: 'white', fontWeight: 600, fontSize: 50, textAlign: 'center', marginLeft: 29 }}>
                                {current?.temp_c}&#176;
                            </Text>
                            <Text style={{ color: 'white', fontWeight: 200, fontSize: 20, textAlign: 'center', letterSpacing: 2 }}>
                                {current?.condition?.text}
                            </Text>
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 12 }}>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Image source={require('../assets/icon/wind.png')}
                                    style={{ width: 30, height: 30 }}
                                />
                                <Text style={{ color: 'white', fontWeight: 400 }}>
                                    {current?.wind_kph} km/h
                                </Text>
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Image source={require('../assets/icon/drop.png')}
                                    style={{ width: 30, height: 30 }}
                                />
                                <Text style={{ color: 'white', fontWeight: 400 }}>
                                    {current?.humidity}% Humidity
                                </Text>
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Image source={require('../assets/icon/sun.png')}
                                    style={{ width: 30, height: 30 }}
                                />
                                <Text style={{ color: 'white', fontWeight: 400 }}>
                                    {weather?.forecast?.forecastday[0]?.astro.sunrise}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={{
                        marginBottom: 4, spaceY3: {
                            marginTop: 0,
                            marginBottom: 12,  // This corresponds to space-y-3 in Tailwind CSS
                            // Other styles
                        },
                    }}>
                        <View style={{
                            display: 'flex', flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, spaceY3: {
                                marginTop: 0,
                                marginBottom: 12,  // This corresponds to space-y-3 in Tailwind CSS
                                // Other styles
                            },
                        }}>
                            <CalendarDaysIcon size="25" color="white" />
                            <Text style={{ color: 'white', marginLeft: 3 }}>
                                Daily Forecast
                            </Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginHorizontal: 10 }}
                        >
                            {
                                weather?.forecast?.forecastday?.map((item, index) => {
                                    let date = new Date(item?.date)
                                    let dayName = date.toLocaleString('en-US', { weekday: 'long' })
                                    dayName = dayName.slice(0, 3)
                                    return (
                                        <View key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 90, borderRadius: 20, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.15)', margin: 10, }}>
                                            <Image source={weatherImages[item?.day?.condition?.text]} style={{ width: 50, height: 50 }} />
                                            <Text style={{ color: 'white' }}>
                                                {dayName}
                                            </Text>
                                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 500 }}>{item?.day?.avgtemp_c}&#176;</Text>
                                        </View>
                                    )
                                })
                            }


                        </ScrollView>


                    </View>
                </SafeAreaView>
            }

        </View>
    )
}
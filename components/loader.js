import { View, Text, Dimensions } from 'react-native'
import React from 'react'
import * as Progress from "react-native-progress"

const {width,height} = Dimensions.get('window')
export  function Load() {
  return (
    <View style={{height,width,position:'absolute',flexDirection:'row',display:'flex',justifyContent:'center',alignItems:'center'}}>
      <Progress.CircleSnail thickness={12} size={160} color='#eab308' />
    </View>
  )
}
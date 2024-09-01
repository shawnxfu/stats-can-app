import {
    createSlice,
    createSelector,
    createAsyncThunk,
  } from '@reduxjs/toolkit';


  export const fetchCharacteristics = createAsyncThunk("local/fetchCharacteristics", 
    async ({codes}) => {
      const resp = await fetch(`https://stats-can-api.fuxianghit.workers.dev/api/v1/characteristics/${codes}`);
      return resp.json();
  });

  export const fetchStats = createAsyncThunk("remote/fetchStats", 
    async ({geos, codes}) => {
      const dataflow = geos[0].type === 1 ? "DF_PR" : "DF_CMACA";
      const geoIds = geos.map(geo => geo.id);
      const url = `https://api.statcan.gc.ca/census-recensement/profile/sdmx/rest/data/STC_CP,${dataflow}/A5.${geoIds.join("+")}..${codes.join("+")}.?detail=dataonly&format=jsondata`;
      const resp = await fetch(url);
      return resp.json();
  });

  const contentSlice = createSlice({
    name: "content",
    initialState: {
      selectedGeo: {},
      selectedTopic: {},
      selectedCharacteristic: {},
      characteristics: {},
      compareWith: [],
      pending: {
        characteristicIds: {},
        statsIds: {},
      }
    },
    reducers: {
      setSelectedGeo: (state, action) => {
        state.selectedGeo = action.payload;
      },
      setSelectedTopic: (state, action) => {
        state.selectedTopic = action.payload;
      },
      setSelectedCharacteristic: (state, action) => {
        state.selectedCharacteristic = action.payload;
      },
      setCompareWith: (state, action) => {
        state.compareWith = action.payload;
      },
    },
    extraReducers: (builder) => { builder
        .addCase(fetchCharacteristics.pending, (state, action) => {
            const {codes} = action.meta.arg;
            Object.values(codes).forEach(code => {
              // state.characteristics[code] = {status: 'pending'};
              state.pending.characteristicIds[code] = 1;
            });
        })
        .addCase(fetchCharacteristics.fulfilled, (state, action) => {
            // const {codes} = action.meta.arg;
            Object.values(action.payload.characteristics).map(d => {
              delete state.pending.characteristicIds[d.id];

              const characteristic = state.characteristics[d.id];
              state.characteristics[d.id] =  characteristic ? {...characteristic, ...d} : {...d}; // stats data may have arrived
              // console.log(d);
            })
        })
        .addCase(fetchCharacteristics.rejected, (state, action) => {
          const {codes} = action.meta.arg;
          Object.values(codes).map(code => {
            delete state.pending.characteristicIds[code];
          })
        })
        // fetchStats
        .addCase(fetchStats.pending, (state, action) => {
          const {codes} = action.meta.arg;
          Object.values(codes).forEach(code => {
            // state.characteristics[code] = {statsStatus: 'pending'};
            state.pending.statsIds[code] = 1;
          });
        })
        .addCase(fetchStats.fulfilled, (state, action) => {
            const {geos, codes} = action.meta.arg;
            const dataSeries = action.payload.data.dataSets[0].series;
            const structureSeries = action.payload.data.structures[0].dimensions.series;
            const geo = structureSeries[1]

            function calcSerialString(geoName, gender, cid, statistic) {
              const array = [
                '0',  // Frequency 
                '0',  // Area
                '0',  // Gender
                '0',  // Characteristic
                '0',  // Statistic
              ];

              let values = structureSeries[1].values; // Area
              for (let i=0; i<values.length; i++) {
                  if (values[i].name === geoName) {
                    array[1] = String(i);
                    break;
                  }
              }

              values = structureSeries[2].values; // Gender
              for (let i=0; i<values.length; i++) {
                  if (values[i].name === gender) {
                    array[2] = String(i);
                    break;
                  }
              }
              values = structureSeries[3].values; // Characteristic
              for (let i=0; i<values.length; i++) {
                  if (values[i].id === cid) {
                    array[3] = String(i);
                    break;
                  }
              }
              values = structureSeries[4].values; // Statistic
              for (let i=0; i<values.length; i++) {
                  if (values[i].name === statistic) {
                    array[4] = String(i);
                    break;
                  }
              }
              
              return array.join(":");
            }
            
            Object.values(geos).forEach(geo =>  {
              Object.values(codes).forEach(code => {
                delete state.pending.statsIds[code];
                const countTotal = dataSeries[calcSerialString(geo.name, 'Total', code, 'Counts')];
                const countMen   = dataSeries[calcSerialString(geo.name, 'Men+',  code, 'Counts')];
                const countWomen = dataSeries[calcSerialString(geo.name, 'Women+',code, 'Counts')];

                const rateTotal =  dataSeries[calcSerialString(geo.name, 'Total', code, 'Rates')];
                const rateMen   =  dataSeries[calcSerialString(geo.name, 'Men+',  code, 'Rates')];
                const rateWomen =  dataSeries[calcSerialString(geo.name, 'Women+',code, 'Rates')];
                
                const obs = [
                  countTotal.observations[0][0], 
                  countMen.observations[0][0], 
                  countWomen.observations[0][0],
                  rateTotal.observations[0][0], 
                  rateMen.observations[0][0], 
                  rateWomen.observations[0][0],
                ];
                const characteristic = state.characteristics[code]; // fetch characteristic is supposed to have arrived and set to state
                const data = {...characteristic?.['data'], [geo.id]: obs};
                state.characteristics[code] = characteristic ? 
                  {...characteristic, data: data} : {data: data};

                // console.log(`loaded ${geo.id} ${code}: ${obs}`);
              });
            });
             
        })
        .addCase(fetchStats.rejected, (state, action) => {
            const {codes} = action.meta.arg;
            Object.values(codes).forEach(code => {
              // state.characteristics[code] = {statsStatus: 'error'};
              delete state.pending.statsIds[code];
            });
        });
    },
  });


export const {
  setSelectedGeo,
  setSelectedTopic,
  setSelectedCharacteristic,
  setCompareWith,
} = contentSlice.actions;

export default contentSlice.reducer;

export const selectGeo = (state) => {
  return state.content.selectedGeo;
}

export const selectTopic = (state) => {
  return state.content.selectedTopic;
}

export const selectCharacteristic = (state) => {
  return state.content.selectedCharacteristic;
}

export const selectAllCharacteristics = (state) => {
  return state.content.characteristics;
}

export const selectCharacteristicsData = createSelector(
  selectAllCharacteristics,
  (chs) => Object.values(chs).filter(ch => ch?.['data'])
)

export const selectCompareWith = (state) => {
  return state.content.compareWith;
}

export const selectPendingCharacteristicIds = (state) => {
  return state.content.pending.characteristicIds;
}

export const selectPendingStatsIds = (state) => {
  return state.content.pending.statsIds;
}

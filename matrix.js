import Vue from 'vue'
import HighchartsVue from 'highcharts-vue'

import Highcharts from 'highcharts'
import stockInit from 'highcharts/modules/stock'
import heatmapInit from 'highcharts/modules/heatmap'
import boostCanvasInit from 'highcharts/modules/boost-canvas'
import boostInit from 'highcharts/modules/boost'

import store from '../store.js'
import Suggest from '../components/Suggest'

stockInit(Highcharts)
heatmapInit(Highcharts)
boostCanvasInit(Highcharts)
boostInit(Highcharts)
Vue.use(HighchartsVue)
Highcharts.setOptions({
  lang:{
    resetZoom: "　reset　"
  }
})
export default Vue.component('matrix', {
  template: `
  <div v-cloak>
    <div class="page-matrix-index--controller">
      <div class="page-matrix-index--controller__search">
        <span class="page-matrix-index--controller__search__label">検索：</span>
        <Suggest @send-data="createMatrix"></Suggest>
      </div>
      <slot></slot>
    </div>
    <div class="js-matrix">
      <highcharts  :options="chartOptions" :callback="someFunction" style="min-width:1024px; height:1024px;"></highcharts>
      <div class="js-matrix--pre" v-if="store.state.isPreview">
        <div class="js-matrix--pre__message">Create matrix</div>
      </div>
      <transition leave-active-class="animated fadeOut">
        <div class="js-loader" v-if="store.state.isLoading">
          <div class="js-loader--message">
            <div class="js-loader--message__title"> {{store.data.companyName}}</div>
            <div class="js-loader--message__text">creating...</div>
          </div>
          <div class="js-loader--bg"></div>
        </div>
      </transition>
      <transition leave-active-class="animated fadeOut">
        <div class="js-matrix--error" v-if="store.state.error.flag">
          <div class="js-matrix--error__message">
            <div class="js-matrix--error__message__title">{{store.state.error.title}}</div>
            <div class="js-matrix--error__message__text" v-html="store.state.error.text"></div>
            <button class="js-matrix--error__message__close" @click="store.state.error.flag = false"></button>
          </div>
          <div class="js-matrix--error__bg"></div>
        </div>
      </transition>
    </div>
  </div>
  `,
  components: {
    Suggest
  },

  data() {
    return {
      store:store,
      url:{
        getToken: "/api/accesstoken"
      },

      // updateArgs: [true, true, {duration: 1000}],
      chartOptions: {  
        plotOptions: {
          series: {
            cropThreshold: 10000,
            // nullColor:"#ff0000",
            point: {
              events: {
                click: function () {
                  console.log(this)
                  console.log(this.num)
                }
              }
            },
  
            // pointPadding: 1,
            borderWidth: 1,
            borderColor: '#f6f6f6',
            // boostThreshold: 100,
            turboThreshold: 30000,
            dataLabels: {
              enabled: false,
              color: '#fff',
              overflow: 'allow',
              crop: true,
              style: {
                textOutline:0,
                fontWeight: 'normal'
              },
              formatter: function() {
                if (this.point.num > 100) {
                  if(this.point.value >80){
                    return '<span style="color:#333;">99+</span>'
                  }else{
                    return "99+"
                  }
                }else if (this.point.num > 0) {
                  if(this.point.value >80){
                    return '<span style="color:#333;">' + this.point.num + '</span>'
                  }else{
                    return this.point.num
                  }
                }
              }
            }
          },

        },

        chart: {
          type: 'heatmap',
          plotBorderWidth: 1,
          backgroundColor:'#f6f6f6',
          zoomType: 'xy',
          panning: true,
          panKey: 'shift',
          resetZoomButton:{
            // relativeTo: "chart",
            position:{
              y:-40,
              verticalAlign: "bottom"
            },
            theme: {
              fill: '#454a4d',
              stroke: 'silver',

              style: {
                color: 'white'
              },
              states:{
                hover:{
                  fill: '#5d6468'
                }
              }
            }
          },
          events:{
            load: function(event){
              

            },
            selection: function (event) {
              if(event.xAxis){
                for (var s in this.series) {
                  this.series[s].update({ 
                    dataLabels: {
                      enabled: true
                    }
                  });
                }  
              }else{
                for (var s in this.series) {
                  console.log("zoomOut-- " + s)
                  this.series[s].update({ 
                    dataLabels: {
                      enabled: false
                    }
                  });
                }  
              }
            }    
          }
        },
        boost: {
          useGPUTranslations: true
        },
       

        title: {
          text: ''
        },

        xAxis: {
          opposite:true,
          gridLineWidth:1,
          gridLineColor:"#eaeaea",
          crosshair: true,
          startOnTick:false,
          endOnTick:false,
          tickWidth:1,
          scrollbar: {
            enabled: true,
            liveRedraw:false
          },
          min:0,
          // max:140,
          labels:{
            align: 'right',
            reserveSpace: true,
            rotation: 90,
            // y:0,
            // style: {
            //   writingMode: "vertical-lr"
            // },
            // useHTML: true,           
            // formatter() {
            //   let label = this.value;
            //   let title = this.value;
            //   let style = `writing-mode:vertical-rl; -ms-writing-mode:tb-rl;`; // <- YOUR OWN STYLE
            //   return `<div style="${style}" title="${title}">${label}</div>`;
            // }
            formatter() {
              let style = `writing-mode:vertical-rl; -ms-writing-mode:tb-rl;`;
              if(store.data.marketScore[this.value] === "far"){
                return `<div style="color:#cc0405;">${this.value}</div>`;
              }else{
                return `<div style="">${this.value}</div>`;
              }
            }
          },
          categories: []
        },
        yAxis: {
          crosshair: true,
          reversed: true,
          gridLineWidth:1,
          gridLineColor:"#eaeaea",
          startOnTick:false,
          endOnTick:false,
          tickWidth:1,
          scrollbar: {
            enabled: true
          },
          // min:0,
          // max:24,
          categories: [],
          title: null,
          labels:{
            useHTML: true,
            formatter() {
              let label = this.value;
              let title = this.value;
              let style = `text-align:right; width:15em; text-overflow: ellipsis; overflow: hidden;`;
              return `<div style="${style}" title="${title}">${label}</div>`;
            }
          }
        },
        colorAxis: {
          dataClasses: [
            {
              to: 0,
              color:"#f6f6f6"
            },
            {
              from:0,
              to: 20,
              color:"#cc0405"
            },
            {
              from:21,
              to: 79,
              color:"#fd8f8e"
            },
            {
              from: 80,
              color:"#fed8d8"
            }
          ]
        },
        legend: {
          enabled:false,
        },

        tooltip: {
          useHTML:true,
          formatter: function () {
            return '<b>〇〇：</b>' + this.series.xAxis.categories[this.point.x] + '<br>' +
            '<b>〇〇〇〇：</b>' + this.series.yAxis.categories[this.point.y] + '<br>' + 
            '<b>〇〇〇〇〇〇：</b>' + this.point.num + '件' + '<br>' + 
            '<b>〇〇〇〇〇〇：</b>' + this.point.citing + '→' + this.point.cited;
          }
        },
        series: [{
          borderWidth: 1,
          data: [],
        }]
      },
    }
  },
  props: {
    tenantname: { required: true }
  },

  created() {
    store.setcompanyName(this.tenantname)
    console.log(store.data.companyName)
  },

  computed: {

  },
  methods: {
    someFunction: function(){
      console.log("somefunc")
    },
    filteringXcategoryValue: function(arr){
      const scores = [];
      const cellValueArr = arr;
      const filteringCellValueArr = cellValueArr.filter(function(martixCell){
        return (martixCell.value >= 0 && martixCell.value <= 20 &&  martixCell.value !== null);
      })
      for(var key in filteringCellValueArr){        
        scores.push(filteringCellValueArr[key].x);
      }
      const xCategoryScores = scores.filter(function(x,i, self){
        return self.indexOf(x) === i;
      })
      return xCategoryScores;
    },
    createMarketScore: function(xcategory, arr){
      this.store.data.marketScore = {};
      for(let i = 0; i< arr.length; i++){
        this.store.data.marketScore[xcategory[arr[i]]] = "far"
      }
    },


    createMatrix: function(matrixResults) {
      if(matrixResults.data.length === 0){
        // this.chartOptions.title.text = "";
        this.chartOptions.xAxis.categories = "";
        this.chartOptions.yAxis.categories = "";
        this.chartOptions.series[0].data = "";
      }else{
        this.createMarketScore(matrixResults.xCategory, this.filteringXcategoryValue(matrixResults.data))
        // this.chartOptions.title.text = "「" + store.data.companyName + "」のマトリックス";
        this.chartOptions.xAxis.categories = matrixResults.xCategory;
        this.chartOptions.yAxis.categories = matrixResults.yCategory;
        this.chartOptions.series[0].data = matrixResults.data;  
      }
    },
  }
});

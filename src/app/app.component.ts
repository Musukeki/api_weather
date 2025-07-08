import { HttpClientService } from './@http-client/http-client.service';
// import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-root',
  template: `<p>{{ dateTime }}</p>`,
  imports: [
    RouterOutlet,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'api_demo';

  constructor(private httpClientService: HttpClientService) {}

  // 取得的資料為 JSON 格式，因此建議使用 any 型別
  apiData: any;
  allTime: any;
  locationInfo: any = {};
  localTime: any = DateTime.now().setZone('Asia/Taipei').toISO();
  dataTime: any;
  dataTimeTrans: Array<any> = [];

  ngOnInit(): void {

    // 呼叫服務(service)中的方法
    // subscribe 表示

    let authCode = 'CWA-EE9E6380-F636-47BD-8B8D-C38DB50542D4';
    let apiUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-065?Authorization=${authCode}&limit=10&format=JSON`

    this.httpClientService.getApi(apiUrl).subscribe((res: any) => {

      this.apiData = res.records.Locations[0];
      this.allTime = this.apiData.Location[0].WeatherElement[9].Time;

      this.dataTime = this.apiData.Location[0].WeatherElement[9].Time

      this.dataTime.forEach((i: any) => {
        if(
          new Date(i.StartTime).getHours() == 0 ||
          new Date(i.StartTime).getHours() == 6 ||
          new Date(i.StartTime).getHours() == 12 ||
          new Date(i.StartTime).getHours() == 18 ) {
            this.dataTimeTrans.push({
              timeTrans: `${new Date(i.StartTime).getFullYear()}/${new Date(i.StartTime).getMonth()+1}/${new Date(i.StartTime).getDate()} (${new Date(i.StartTime).getHours()}時)`,
              timeOrigin: i.StartTime
            })
        }
      })
      console.log(this.dataTimeTrans) // 全域時間控制
      this.locationInit()
    })

  }

  locationInit() { // 初始
    this.locationInfo.name = this.apiData.Location[0].LocationName; // 地區
    this.locationInfo.temp = this.apiData.Location[0].WeatherElement[0].Time[0].ElementValue[0].Temperature; // 溫度
    this.locationInfo.apparentTemp = this.apiData.Location[0].WeatherElement[3].Time[0].ElementValue[0].ApparentTemperature; // 體感溫度

    this.locationInfo.humidity = this.apiData.Location[0].WeatherElement[2].Time[0].ElementValue[0].RelativeHumidity; // 相對濕度
    this.locationInfo.windRose = this.apiData.Location[0].WeatherElement[6].Time[0].ElementValue[0].WindDirection; // 風向
    this.locationInfo.windSpeed = this.apiData.Location[0].WeatherElement[5].Time[0].ElementValue[0].WindSpeed; // 風速
    this.locationInfo.beaufortScale = this.apiData.Location[0].WeatherElement[5].Time[0].ElementValue[0].BeaufortScale; // 蒲福風速
    this.locationInfo.comfortIndex = this.apiData.Location[0].WeatherElement[4].Time[0].ElementValue[0].ComfortIndex; // 舒適指數
    this.locationInfo.comfortDescription = this.apiData.Location[0].WeatherElement[4].Time[0].ElementValue[0].ComfortIndexDescription; // 舒適度
    this.locationInfo.precipitation = this.apiData.Location[0].WeatherElement[7].Time[0].ElementValue[0].ProbabilityOfPrecipitation; // 降雨機率
    this.locationInfo.weather = this.apiData.Location[0].WeatherElement[8].Time[0].ElementValue[0].Weather; // 天氣現象
    this.locationInfo.description = this.apiData.Location[0].WeatherElement[9].Time[0].ElementValue[0].WeatherDescription; // 綜合描述

    this.locationInfo.transTime = `${new Date(this.dataTime[0].StartTime).getFullYear()}/${new Date(this.dataTime[0].StartTime).getMonth()+1}/${new Date(this.dataTime[0].StartTime).getDate()} (${new Date(this.dataTime[0].StartTime).getHours()}時)`
  }

  chooseLocation(event: MouseEvent) {
    let elementName = (event.target as HTMLButtonElement).className
    console.log(this.apiData.Location, elementName)
    for(let name of this.apiData.Location) {
      if(name.LocationName == elementName) { // 地區
        this.locationInfo.name = name.LocationName

        for(let temp of name.WeatherElement[0].Time) { // 溫度
          if(
            new Date(temp.DataTime).getFullYear() == new Date(this.localTime).getFullYear() &&
            new Date(temp.DataTime).getMonth() == new Date(this.localTime).getMonth() &&
            new Date(temp.DataTime).getDate() == new Date(this.localTime).getDate() &&
            new Date(temp.DataTime).getHours() <= new Date(this.localTime).getHours()) {

              if(this.locationInfo.chooseTime == undefined) { // 判斷是否沒有注入時間屬性
                this.locationInfo.chooseTime = this.localTime;
                this.locationInfo.temp = temp.ElementValue[0].Temperature
              } else {
                for(let item of name.WeatherElement[0].Time) {
                  if(this.locationInfo.chooseTime == item.DataTime) {
                    this.locationInfo.temp = item.ElementValue[0].Temperature;
                  }
                }
              }
              break;
            }
        }

        for(let apparentTemp of name.WeatherElement[3].Time) { // 體感溫度
          if(
            new Date(apparentTemp.DataTime).getFullYear() == new Date(this.localTime).getFullYear() &&
            new Date(apparentTemp.DataTime).getMonth() == new Date(this.localTime).getMonth() &&
            new Date(apparentTemp.DataTime).getDate() == new Date(this.localTime).getDate() &&
            new Date(apparentTemp.DataTime).getHours() <= new Date(this.localTime).getHours() &&
            new Date(apparentTemp.DataTime).getHours() <= new Date(this.localTime).getHours()) {

              this.locationInfo.apparentTemp = apparentTemp.ElementValue[0].ApparentTemperature
              if(this.locationInfo.chooseTime == undefined) { // 判斷是否沒有注入時間屬性
                this.locationInfo.chooseTime = this.localTime;
                this.locationInfo.apparentTemp = apparentTemp.ElementValue[0].ApparentTemperature
              } else {
                for(let item of name.WeatherElement[3].Time) {
                  if(this.locationInfo.chooseTime == item.DataTime) {
                    this.locationInfo.apparentTemp = item.ElementValue[0].ApparentTemperature;
                  }
                }
              }
              break;
            }
        }

        for(let humidity of name.WeatherElement[2].Time) { // 相對濕度
          if(
            new Date(humidity.DataTime).getFullYear() == new Date(this.localTime).getFullYear() &&
            new Date(humidity.DataTime).getMonth() == new Date(this.localTime).getMonth() &&
            new Date(humidity.DataTime).getDate() == new Date(this.localTime).getDate() &&
            new Date(humidity.DataTime).getHours() <= new Date(this.localTime).getHours()) {

              if(this.locationInfo.chooseTime == undefined) { // 判斷是否沒有注入時間屬性
                this.locationInfo.chooseTime = this.localTime;
                this.locationInfo.humidity = humidity.ElementValue[0].RelativeHumidity
              } else {
                for(let item of name.WeatherElement[2].Time) {
                  if(this.locationInfo.chooseTime == item.DataTime) {
                    this.locationInfo.humidity = item.ElementValue[0].RelativeHumidity;
                  }
                }
              }
              break;
            }
        }

        for(let windRose of name.WeatherElement[6].Time) { // 風向
          if(
            new Date(windRose.DataTime).getFullYear() == new Date(this.localTime).getFullYear() &&
            new Date(windRose.DataTime).getMonth() == new Date(this.localTime).getMonth() &&
            new Date(windRose.DataTime).getDate() == new Date(this.localTime).getDate() &&
            new Date(windRose.DataTime).getHours() <= new Date(this.localTime).getHours()) {

              if(this.locationInfo.chooseTime == undefined) { // 判斷是否沒有注入時間屬性
                this.locationInfo.chooseTime = this.localTime;
                this.locationInfo.windRose = windRose.ElementValue[0].WindDirection
              } else {
                for(let item of name.WeatherElement[6].Time) {
                  if(this.locationInfo.chooseTime == item.DataTime) {
                    this.locationInfo.windRose = item.ElementValue[0].WindDirection;
                  }
                }
              }
              break;
          }
        }

        for(let windSpeedInfo of name.WeatherElement[5].Time) { // 風速
          if(
            new Date(windSpeedInfo.DataTime).getFullYear() == new Date(this.localTime).getFullYear() &&
            new Date(windSpeedInfo.DataTime).getMonth() == new Date(this.localTime).getMonth() &&
            new Date(windSpeedInfo.DataTime).getDate() == new Date(this.localTime).getDate() &&
            new Date(windSpeedInfo.DataTime).getHours() <= new Date(this.localTime).getHours()) {

              if(this.locationInfo.chooseTime == undefined) { // 判斷是否沒有注入時間屬性
                this.locationInfo.chooseTime = this.localTime;
                this.locationInfo.windSpeed = windSpeedInfo.ElementValue[0].WindSpeed;
                this.locationInfo.beaufortScale = windSpeedInfo.ElementValue[0].BeaufortScale;
              } else {
                for(let item of name.WeatherElement[5].Time) {
                  if(this.locationInfo.chooseTime == item.DataTime) {
                    this.locationInfo.windSpeed = item.ElementValue[0].WindSpeed;
                    this.locationInfo.beaufortScale = item.ElementValue[0].BeaufortScale;
                  }
                }
              }
              break;
          }
        }

        for(let comfort of name.WeatherElement[4].Time) { // 風速
          if(
            new Date(comfort.DataTime).getFullYear() == new Date(this.localTime).getFullYear() &&
            new Date(comfort.DataTime).getMonth() == new Date(this.localTime).getMonth() &&
            new Date(comfort.DataTime).getDate() == new Date(this.localTime).getDate() &&
            new Date(comfort.DataTime).getHours() <= new Date(this.localTime).getHours()) {

              if(this.locationInfo.chooseTime == undefined) { // 判斷是否沒有注入時間屬性
                this.locationInfo.chooseTime = this.localTime;
                this.locationInfo.comfortIndex = comfort.ElementValue[0].ComfortIndex;
                this.locationInfo.comfortDescription = comfort.ElementValue[0].ComfortIndexDescription;
              } else {
                for(let item of name.WeatherElement[4].Time) {
                  if(this.locationInfo.chooseTime == item.DataTime) {
                    this.locationInfo.comfortIndex = item.ElementValue[0].ComfortIndex;
                    this.locationInfo.comfortDescription = item.ElementValue[0].ComfortIndexDescription;
                  }
                }
              }
              break;
          }
        }

        for(let precipitation of name.WeatherElement[7].Time) { // 3小時降雨機率
          if(
            new Date(precipitation.StartTime).getFullYear() == new Date(this.localTime).getFullYear() &&
            new Date(precipitation.StartTime).getMonth() == new Date(this.localTime).getMonth() &&
            new Date(precipitation.StartTime).getDate() == new Date(this.localTime).getDate() &&
            new Date(precipitation.StartTime).getHours() <= new Date(this.localTime).getHours()) {

              if(this.locationInfo.chooseTime == undefined) { // 判斷是否沒有注入時間屬性
                this.locationInfo.chooseTime = this.localTime;
                this.locationInfo.precipitation = precipitation.ElementValue[0].ProbabilityOfPrecipitation
              } else {
                for(let item of name.WeatherElement[7].Time) {
                  if(this.locationInfo.chooseTime == item.DataTime) {
                    this.locationInfo.precipitation = item.ElementValue[0].ProbabilityOfPrecipitation;
                  }
                }
              }
              break;
          }
        }

        for(let weather of name.WeatherElement[8].Time) { // 天氣現象
          if(
            new Date(weather.StartTime).getFullYear() == new Date(this.localTime).getFullYear() &&
            new Date(weather.StartTime).getMonth() == new Date(this.localTime).getMonth() &&
            new Date(weather.StartTime).getDate() == new Date(this.localTime).getDate() &&
            new Date(weather.StartTime).getHours() <= new Date(this.localTime).getHours()) {

              if(this.locationInfo.chooseTime == undefined) { // 判斷是否沒有注入時間屬性
                this.locationInfo.chooseTime = this.localTime;
                this.locationInfo.weather = weather.ElementValue[0].Weather
              } else {
                for(let item of name.WeatherElement[8].Time) {
                  if(this.locationInfo.chooseTime == item.DataTime) {
                    this.locationInfo.weather = item.ElementValue[0].Weather;
                  }
                }
              }
              break;
          }
        }

        for(let description of name.WeatherElement[9].Time) { // 天氣預報綜合描述
          if(
            new Date(description.StartTime).getFullYear() == new Date(this.localTime).getFullYear() &&
            new Date(description.StartTime).getMonth() == new Date(this.localTime).getMonth() &&
            new Date(description.StartTime).getDate() == new Date(this.localTime).getDate() &&
            new Date(description.StartTime).getHours() <= new Date(this.localTime).getHours()) {

              if(this.locationInfo.chooseTime == undefined) { // 判斷是否沒有注入時間屬性
                this.locationInfo.chooseTime = this.localTime;
                this.locationInfo.description = description.ElementValue[0].WeatherDescription
              } else {
                for(let item of name.WeatherElement[9].Time) {
                  if(this.locationInfo.chooseTime == item.DataTime) {
                    this.locationInfo.description = item.ElementValue[0].WeatherDescription;
                  }
                }
              }
              break;
          }
        }
      }
    }
    // console.log(this.locationInfo, this.apiData)
  }

  checkTime(event: MouseEvent) {
    let elementTime = (event.target as HTMLButtonElement).id
    this.locationInfo.chooseTime = elementTime
    this.locationInfo.transTime = (event.target as HTMLButtonElement).innerText;

    for(let item of this.apiData.Location) {
      if(item.LocationName == this.locationInfo.name) {
        for(let time of item.WeatherElement[0].Time) { // 時間切換溫度
          if(time.DataTime == elementTime) {
            this.locationInfo.temp = time.ElementValue[0].Temperature;
          }
        }

        for(let apparentTemp of item.WeatherElement[3].Time) { // 時間切換體感溫度
          if(apparentTemp.DataTime == elementTime) {
            this.locationInfo.apparentTemp = apparentTemp.ElementValue[0].ApparentTemperature;
          }
        }

        for(let humidity of item.WeatherElement[2].Time) { // 時間切換相對濕度
          if(humidity.DataTime == elementTime) {
            this.locationInfo.humidity = humidity.ElementValue[0].RelativeHumidity;
          }
        }

        for(let windRose of item.WeatherElement[6].Time) { // 時間切換風向
          if(windRose.DataTime == elementTime) {
            this.locationInfo.windRose = windRose.ElementValue[0].WindDirection;
          }
        }

        for(let windSpeed of item.WeatherElement[5].Time) { // 時間切換風速
          if(windSpeed.DataTime == elementTime) {
            this.locationInfo.windSpeed = windSpeed.ElementValue[0].WindSpeed;
            this.locationInfo.beaufortScale = windSpeed.ElementValue[0].BeaufortScale;
          }
        }

        for(let comfort of item.WeatherElement[4].Time) { // 時間切換舒適度指數
          if(comfort.DataTime == elementTime) {
            this.locationInfo.comfortIndex = comfort.ElementValue[0].ComfortIndex;
            this.locationInfo.comfortDescription = comfort.ElementValue[0].ComfortIndexDescription;
          }
        }

        for(let precipitation of item.WeatherElement[7].Time) { // 時間切換3小時降雨機率
          if(precipitation.StartTime == elementTime) {
            this.locationInfo.precipitation = precipitation.ElementValue[0].ProbabilityOfPrecipitation;
          }
        }

        for(let weather of item.WeatherElement[8].Time) { // 時間天氣現象
          if(weather.StartTime == elementTime) {
            this.locationInfo.weather = weather.ElementValue[0].Weather;
          }
        }

        for(let description of item.WeatherElement[9].Time) { // 時間切換風速
          if(description.StartTime == elementTime) {
            this.locationInfo.description = description.ElementValue[0].WeatherDescription;
          }
        }
      }
    }
    console.log(this.locationInfo)
  }

}

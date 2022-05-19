import storage from 'storejs'
import {
  FAVORITE_SONG_KEY,
  PLAY_MODE,
  recentlyPlayListKEY,
  SearchHistoryListKEY,
  SINGER_KEY,
} from '../assets/js/constant.js'

export default {
  // 播放器列表
  playList: (storage.get(SINGER_KEY) && storage.get(SINGER_KEY).songs) || [],
  // 顺序播放列表
  sequenceList:
    (storage.get(SINGER_KEY) && storage.get(SINGER_KEY).songs) || [],
  // 播放器是否全屏状态
  fullScreen: false,
  // 播放模式
  playMode: PLAY_MODE.sequence,
  // 当前播放歌曲的索引
  currentIndex: -1,
  // 播放的状态
  isPlaying: false,
  // 喜欢的歌曲
  favoriteSongList: storage.get(FAVORITE_SONG_KEY) || [],
  // 最近播放的歌曲
  recentlyPlayList: storage.get(recentlyPlayListKEY) || [],
  // 搜索历史
  //searchHistoryList: storage.get(SearchHistoryListKEY) || [],
  searchHistoryList: storage.get(SearchHistoryListKEY) || [],
  currentSingerInfo: JSON.parse(localStorage.getItem(SINGER_KEY)) || {},
}

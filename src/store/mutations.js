import storage from 'storejs'
import { Toast } from 'vant'
import {
  FAVORITE_SONG_KEY,
  recentlyPlayListKEY,
  SearchHistoryListKEY,
} from '../assets/js/constant.js'

export default {
  setCurrentSingerInfo(state, singer) {
    state.currentSingerInfo = singer
  },
  // 添加一首歌曲到列表后面
  addToPlayListQueue(state, song) {
    // debugger;
    const playList = state.playList.slice()
    const sequenceList = state.sequenceList.slice()
    const sFindIndex = sequenceList.findIndex(item => item.id === song.id)
    const findIndex = playList.findIndex(item => item.id === song.id)
    if (sFindIndex === -1) {
      sequenceList.push(song)
      state.sequenceList = sequenceList
    }
    if (findIndex === -1) {
      playList.push(song)
      // state.playList.push(song);
      state.playList = playList
      // if (sFindIndex === -1) {
      //   sequenceList.push(song);
      //   state.sequenceList = sequenceList;
      // }
      Toast('添加成功')
    } else {
      Toast('已存在该歌曲')
    }
  },
  // 设置我喜欢的歌曲列表
  setFavoriteSongList(state, list) {
    state.favoriteSongList = list
  },
  // 设置搜索历史列表
  setSearchHistoryList(state, list) {
    state.searchHistoryList = list
    storage.set(SearchHistoryListKEY, list)
  },
  // 添加一个搜索记录
  addTextToSearchHistoryList(state, history) {
    const findItem = state.searchHistoryList.find(
      item => item.searchWord === history.searchWord
    )
    if (!findItem) {
      state.searchHistoryList.unshift({
        searchWord: history.searchWord,
      })
    } else {
      let index = state.searchHistoryList.findIndex(
        item => item.searchWord === findItem.searchWord
      )
      state.searchHistoryList.splice(index, 1)
      state.searchHistoryList.unshift(findItem)
    }
    storage.set(SearchHistoryListKEY, state.searchHistoryList)
  },
  // 从历史记录中删除一个搜索记录
  delTextFromSearchHistoryList(state, history) {
    let findIndex = state.searchHistoryList.findIndex(
      item => item.searchWord === history.searchWord
    )
    if (findIndex > -1) {
      state.searchHistoryList.splice(findIndex, 1)
      storage.set(SearchHistoryListKEY, state.searchHistoryList)
    }
  },
  // 设置最近播放的歌曲
  setRecentlyPlayList(state, list) {
    state.recentlyPlayList = list
    storage.set(recentlyPlayListKEY, list)
  },
  // 添加一首歌曲到最近播放
  addRecentlyPlaySong(state, song) {
    const findItem = state.recentlyPlayList.find(item => item.id === song.id)
    // 如果存在这首歌曲的话,删除,然后添加到最前面去
    if (findItem) {
      const findIndex = state.recentlyPlayList.findIndex(item => {
        return item.id === song.id
      })
      state.recentlyPlayList.splice(findIndex, 1)
      state.recentlyPlayList.unshift(findItem)
      storage.set(recentlyPlayListKEY, state.recentlyPlayList)
    }
    if (!findItem) {
      state.recentlyPlayList.unshift(song)
      //state.playList.push(song);
      storage.set(recentlyPlayListKEY, state.recentlyPlayList)
    }
  },
  // 删除一首歌曲到最近播放
  delRecentlyPlaySong(state, song) {
    //debugger;
    // 获取到当前正在播放的音乐索引
    let currentSongIndex = state.currentIndex
    // 获取到该歌曲在最近播放列表中的索引
    let index = state.recentlyPlayList.findIndex(item => item.id === song.id)
    // 如果存在就删除掉
    if (index > -1) {
      state.recentlyPlayList.splice(index, 1)
      // state.sequenceList.splice(index, 1);
      storage.set(recentlyPlayListKEY, state.recentlyPlayList)
    }
    const playList = state.playList.slice()
    let playIndex = playList.findIndex(item => item.id === song.id)

    if (playIndex > -1 && playList.length === 1) {
      state.currentIndex = -1
      state.isPlaying = false
      // console.log("-1");
      return
    }
    //  console.log("-2");
    if (playIndex > -1 && playIndex === currentSongIndex) {
      currentSongIndex--
      if (currentSongIndex === -1) {
        state.currentIndex = playList.length - 1
      } else {
        state.currentIndex = currentSongIndex
      }
      state.isPlaying = true
      this.commit('addRecentlyPlaySong', playList[state.currentIndex])
      // if (
      //   playIndex < currentSongIndex ||
      //   state.playList.length === currentSongIndex
      // ) {
      //   state.currentIndex = --currentSongIndex;
      //   state.isPlaying = true;
      // }
    }
  },
  // 是否正在播放
  setPlaying(state, isPlaying) {
    state.isPlaying = isPlaying
  },
  // 清空播放列表
  clearPlayList(state) {
    state.playList = []
    state.sequenceList = []
  },
  // 播放器列表
  setPlayList(state, list) {
    // debugger
    const idx = list.findIndex(song => {
      return song.id === state.playList[state.currentIndex]?.id
    })
    console.log(list, 'list')
    // console.log(idx, 'idx')
    if (state.currentIndex !== -1) {
      if (idx > -1) {
        // debugger
        // state.currentIndex = idx
        return
      } else {
        //  debugger
        list.push(state.playList[state.currentIndex])
        state.currentIndex = list.length - 1
        console.log(state.currentIndex, 'state.currentIndex')
      }
    }
    state.playList = list
  },
  // 顺序播放列表
  setSequenceList(state, list) {
    // debugger
    // const idx = list.findIndex(song => {
    //   return song.id === state.playList[state.currentIndex]?.id
    // })
    // if (state.currentIndex !== -1) {
    //   if (idx > -1) {
    //     state.currentIndex = idx
    //   } else {
    //     // list.push(state.playList[state.currentIndex])
    //     // debugger
    //     // state.currentIndex = list.length - 1
    //   }
    // }
    state.sequenceList = list
  },
  // 播放器是否全屏状态
  setFullScreen(state, status) {
    state.fullScreen = status
  },
  // 播放模式
  setPlayMode(state, playMode) {
    state.playMode = playMode
  },
  // 当前播放歌曲的索引
  setCurrentIndex(state, index) {
    state.currentIndex = index
  },
  // 实现歌曲的喜欢不喜欢切换
  toggleFavorite(state, song) {
    const favoriteSongList = state.favoriteSongList
    const findSong = favoriteSongList.find(item => item.id === song.id)
    if (!findSong) {
      // 没有就添加
      state.favoriteSongList.push(song)
      storage.set(FAVORITE_SONG_KEY, state.favoriteSongList)
    } else {
      //如果有，就删除
      let index = favoriteSongList.findIndex(item => item.id === song.id)
      state.favoriteSongList.splice(index, 1)
      storage.set(FAVORITE_SONG_KEY, state.favoriteSongList)
    }
  },
  //将歌曲添加到下一首播放
  addSongNextPlay(state, song) {
    // debugger
    const playList = state.playList.slice()
    const sequenceList = state.sequenceList.slice()
    //当前正在播放歌曲的索引
    let currentPlaySongIndex = state.currentIndex
    // 查找歌曲有没有存在在 playlist 播放歌曲列表中
    let playListIndex = playList.findIndex(item => item.id === song.id)
    let sequenceListIndex = sequenceList.findIndex(item => item.id === song.id)
    // 不是播放的状态 && playListIndex === -1
    if (!state.isPlaying) {
      // debugger
      // 往前面插入
      // playList.unshift(song)
      //state.currentIndex = 0;
      state.playList = playList
      // sequenceList.unshift(song)
      state.currentIndex = playListIndex
      state.isPlaying = true
      state.sequenceList = sequenceList
      Toast('已添加至播放队列')
      return
    }
    if (sequenceListIndex > -1) {
      // state.sequenceList.push(song);
      sequenceList.splice(sequenceListIndex, 1)
      sequenceList.splice(currentPlaySongIndex + 1, 0, song)
    } else {
      sequenceList.splice(currentPlaySongIndex + 1, 0, song)
    }
    // 存在歌曲列表中
    if (playListIndex > -1) {
      // 如果存在的话,先删除掉, 然后再进行插入
      if (playListIndex === currentPlaySongIndex) {
        //debugger;
        return
      }
      playList.splice(playListIndex, 1)
      playList.splice(currentPlaySongIndex + 1, 0, song)
      Toast('已添加至播放队列')
      if (currentPlaySongIndex === -1) {
        currentPlaySongIndex = playListIndex
        console.log(currentPlaySongIndex, 'currentPlaySongIndex')
        state.isPlaying = true
      }
      if (
        playListIndex < currentPlaySongIndex ||
        playListIndex === playList.length
      ) {
        --currentPlaySongIndex
      }
      //console.log(state.playList, "state.playListstate.playList");
    } else {
      // 不存在歌曲列表中
      playList.splice(currentPlaySongIndex + 1, 0, song)
      Toast('已添加至播放队列')
      state.playList = playList
    }
    state.currentIndex = currentPlaySongIndex
    state.playList = playList
    state.sequenceList = sequenceList
    //Toast("请添加歌曲至播放列表");
  },
}

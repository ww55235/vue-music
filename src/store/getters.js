export default {
  playList: state => state.playList,
  // 当前播放的歌曲
  currentSong: state => state.playList[state.currentIndex] || {},
  // 是否全屏
  fullScreen: state => state.fullScreen,
  // 是否正在播放
  isPlaying: state => state.isPlaying,
  // 当前播放歌曲索引
  currentIndex: state => state.currentIndex,
  // 歌曲的长度
  songsLength: state => state.playList.length,
  //喜欢的歌曲
}

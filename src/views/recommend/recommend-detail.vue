<template>
  <div class="recommend-detail">
    <music-list
      @selectSong="selectSong"
      @nextPlay="nextPlay"
      :pic="pic"
      :title="title"
      :songs="songs"
    ></music-list>
  </div>
</template>

<script>
import MusicList from '@/components/music-list/music-list'
import { mapState } from 'vuex'
import storage from 'storejs'
import { SINGER_KEY } from '../../assets/js/constant.js'

export default {
  name: 'recommend-detail',
  components: { MusicList },
  data() {
    return {}
  },
  props: {
    pic: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    songs: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    songs: {
      handler(newVal) {
        console.log(newVal, 'newVal')
      },
    },
  },
  computed: {
    ...mapState(['currentSingerInfo']),
  },
  created() {},
  async mounted() {},
  methods: {
    nextPlay() {
      // console.log(this.songs, "this.songs");
      if (this.songs.length > 0) {
        //  debugger
        this.$store.commit('setPlayList', this.songs)
        this.$store.commit('setSequenceList', this.songs)
      } else {
        // debugger
        this.$store.commit('setPlayList', this.currentSingerInfo.songs)
        this.$store.commit('setSequenceList', this.currentSingerInfo.songs)
      }
    },
    selectSong(song) {
      // 选择歌曲进行播放
      if (this.songs.length > 0) {
        this.$store.commit('setPlayList', this.songs)
        this.$store.commit('setSequenceList', this.songs)
      } else {
        this.$store.commit('setPlayList', this.currentSingerInfo.songs)
        this.$store.commit('setSequenceList', this.currentSingerInfo.songs)
      }
      this.$store.dispatch('selectSong', song)
    },
  },
}
</script>

<style scoped lang="scss">
.recommend-detail {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #222222;
  z-index: 100;
}
</style>

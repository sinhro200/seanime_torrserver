module.exports = class {
    async addMagnet(magnet, data) {
      return fetch(`${this.settings.host}/torrents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          link: magnet,
          title: data.title,
          poster: data.poster,
          save: true
        })
      }).then(r => r.json());
    }
  
    getStreamLink(hash, fileIndex) {
      return `${this.settings.host}/stream/${hash}/${fileIndex}/`;
    }
  }
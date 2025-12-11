class TorrServerDebrid implements DebridProvider {
    // ... предыдущие поля ...

    // Добавить конструктор для инициализации настроек
    constructor(private settings: any) {}

    // Или добавить метод для установки настроек
    setSettings(settings: any) {
        this.settings = settings;
    }

    // В addMagnet добавить авторизацию, если требуется пароль
    async addMagnet(magnet: string, info: DebridAddMagnetInfo): Promise<DebridTorrent> {
        const body: any = {
            action: "add",
            link: magnet,
            title: info.title || "",
            poster: info.poster || "",
            save: true,
            preload: true
        }

        // Добавить авторизацию, если задан пароль
        const headers: any = { "Content-Type": "application/json" };
        if (this.settings.password) {
            headers["Authorization"] = `Basic ${btoa(`admin:${this.settings.password}`)}`;
        }

        const resp = await fetch(`${this.settings.host}/torrents`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        })
        // ...
    }

    // В listTorrents использовать GET-запрос (если TorrServer поддерживает)
    async listTorrents(): Promise<DebridTorrent[]> {
        try {
            const resp = await fetch(`${this.settings.host}/torrents?action=list`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    // Добавить авторизацию, если требуется
                }
            })
            // ...
        } catch {
            return []
        }
    }
}
/// <reference path="./debrid-provider.d.ts" />
/// <reference path="./core.d.ts" />

declare var settings: any;  // Заглушка для this.settings (Seanime inject'ит)

class TorrServerDebrid implements DebridProvider {
    id = "torrserver-local";
    name = "TorrServer (Local)";
    icon = "https://i.ibb.co/0jR0Z3k/torrserver.png";

    getSettings(): DebridProviderSettings {
        return {
            type: "debrid",
            settings: [
                {
                    key: "host",
                    type: "text",
                    title: "TorrServer URL",
                    default: "http://127.0.0.1:8090",
                    description: "Например http://192.168.1.100:8090"
                },
                {
                    key: "password",
                    type: "password",
                    title: "Пароль (если включён в TorrServer)",
                    default: ""
                },
                {
                    key: "preload",
                    type: "number",
                    title: "Прелоад перед стартом (%)",
                    default: 25,
                    min: 5,
                    max: 80
                }
            ]
        };
    }

    async addMagnet(magnet: string, info: DebridAddMagnetInfo): Promise<DebridTorrent> {
        const host = settings?.host || "http://127.0.0.1:8090";  // Используем глобальные settings
        const body: any = {
            action: "add",
            link: magnet,
            title: info.title || "",
            poster: info.poster || "",
            save: true,
            preload: true
        };

        const resp = await fetch(`${host}/torrents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!resp.ok) throw new Error("TorrServer не отвечает или ошибка авторизации");

        const json = await resp.json();
        const hash = json.hash || json.data?.hash?.toLowerCase();

        if (!hash) throw new Error("TorrServer не вернул hash");

        return {
            id: hash,
            hash: hash,
            name: info.title || "Unknown",
            files: []
        };
    }

    async getStream(torrent: DebridTorrent, file: DebridFile): Promise<DebridStream> {
        const host = settings?.host || "http://127.0.0.1:8090";
        const index = file.index ?? 0;
        const filename = encodeURIComponent(file.name || file.path || "video");

        return {
            url: `${host}/stream/${torrent.hash}/${index}/${filename}`,
            preload: settings?.preload || 25
        };
    }

    async getTorrentFiles(torrent: DebridTorrent): Promise<DebridFile[]> {
        // TorrServer не отдаёт список файлов до добавления, поэтому возвращаем заглушку
        // Seanime всё равно сам запросит стрим и TorrServer сам выберет самый большой файл
        return [
            {
                id: "0",
                index: 0,
                name: torrent.name,
                path: torrent.name,
                size: 0
            }
        ];
    }

    async listTorrents(): Promise<DebridTorrent[]> {
        const host = settings?.host || "http://127.0.0.1:8090";
        try {
            const resp = await fetch(`${host}/torrents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "list" })
            });
            if (!resp.ok) return [];
            const data = await resp.json();
            return (data.data || []).map((t: any) => ({
                id: t.hash,
                hash: t.hash.toLowerCase(),
                name: t.title || t.hash,
                files: []
            }));
        } catch {
            return [];
        }
    }
}

export default TorrServerDebrid;
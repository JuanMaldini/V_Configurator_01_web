# Eagle 3D Streaming – WebSDK Bridge

Esta carpeta contiene un “puente” (bridge) para aislar la comunicación entre:

- React (UI: Sidebar, páginas)
- El iframe del player (Eagle 3D Streaming connector)
- Unreal (mensajes que viajan dentro del stream)

## Diagrama

```
[Sidebar Button / UI]
        |
        |  emitDescriptor(descriptor)
        v
[e3dsBridge.ts]
        |
        |  window.postMessage(JSON.stringify({ cmd: "sendToUe4", value: descriptor }))
        v
[IFRAME (E3DS connector)]
        |
        v
[Unreal]

(Back)
[Unreal / connector] -> window.message -> e3dsBridge.ts -> listeners -> React
```

## API pública

Archivo: `e3dsBridge.ts`

- `configureE3dsBridge({ iframeId, iframeSrc?, targetOrigin? })`

  - Registra el `window.addEventListener("message", ...)` una sola vez.
  - Guarda el `iframeId` y el `targetOrigin`.
  - Si no pasas `targetOrigin`, intenta inferirlo desde `iframeSrc` (origin del URL).
  - Si no se puede inferir, usa `"*"` (modo demo/dev).

- `emitDescriptor(descriptor)`

  - Envía un mensaje al iframe con el formato del demo de E3DS:

    ```js
    { cmd: "sendToUe4", value: descriptor }
    ```

  - `descriptor` puede ser string u objeto. Por ahora, en el sidebar se usa un default:

    ```js
    {
      field: "descriptor";
    }
    ```

- `addE3dsEventListener(listener)`

  - Para eventos del connector tipo `stage1_inqueued`, `QueueNumberUpdated`, `sessionExpired`, etc.

- `addE3dsUeMessageListener(listener)`
  - Para mensajes que llegan como JSON string desde Unreal y contienen `cmd`.

## Notas importantes

- Seguridad/origin:

  - El demo usa `postMessage(..., "*")`.
  - Para producción es recomendable usar el origin real del iframe.

- Handshake:
  - El demo responde cuando recibe `type: "isIframe"` enviando `{ cmd: "isIframe", value: true }`.
  - El bridge lo replica.

## Dónde se inicializa

- En la página del player (iframe) se llama `configureE3dsBridge({ iframeId: "iframe_1", iframeSrc: import.meta.env.VITE_SRC_IFRAME_URL })`.
- El botón del sidebar llama `emitDescriptor(DEFAULT_DESCRIPTOR)`.

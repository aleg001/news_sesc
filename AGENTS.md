# Publicación de noticias de Servicio Cívico

Este repositorio publica las noticias de la Secretaría Ejecutiva del Servicio Cívico (SESC). Cuando el usuario proporcione una imagen, una noticia y una fecha, interpretar el mensaje como una solicitud completa para adaptar, agregar, validar, confirmar en Git y publicar la noticia. No pedir título, `id`, nombre de archivo ni aprobación adicional si esos tres insumos están presentes.

## Insumos aceptados

El usuario puede enviar los datos con cualquier redacción, por ejemplo:

```text
Imagen: https://sitio.gt/foto.jpg
Noticia: texto pegado o URL de la noticia fuente
Fecha: 5 de agosto de 2026
```

- Aceptar la noticia como texto pegado o como URL pública. Si es una URL, leer la fuente antes de redactar.
- Interpretar la fecha indicada por el usuario y guardarla como `DD/MM/YYYY`.
- Si falta alguno de los tres insumos, pedir únicamente el dato faltante.

## Tono institucional

Reescribir la información desde la perspectiva institucional de la SESC; no limitarse a copiar ni a cambiar la persona gramatical.

- Usar un tono oficial, claro, sobrio, positivo y orientado al servicio público.
- Destacar, cuando los hechos lo sustenten, la participación juvenil, la coordinación interinstitucional, la formación cívica, el beneficio comunitario y el desarrollo de Guatemala.
- Nombrar de forma preferente a la `Secretaría Ejecutiva del Servicio Cívico` en la primera mención y usar `la Secretaría Ejecutiva` o `la SESC` después.
- Emplear lenguaje inclusivo natural, por ejemplo: `las y los jóvenes` y `las y los servidores cívicos`.
- Conservar con exactitud nombres, cargos, instituciones, lugares, cifras, fechas, nombres de proyectos, enlaces y citas relevantes de la fuente.
- No atribuir a la SESC asistencia, organización, acompañamiento, declaraciones o resultados que la fuente no confirme. El tono institucional nunca autoriza inventar protagonismo.
- Reconocer correctamente a la institución ejecutora o fuente cuando corresponda y presentar a la SESC dentro de su función real de coordinación, rectoría, supervisión o acompañamiento sólo si está sustentada.
- Evitar elogios partidistas o personales, exageraciones, lenguaje publicitario, emojis y hashtags, salvo que formen parte necesaria de una convocatoria o campaña proporcionada por el usuario.
- Cerrar con un compromiso institucional sólo cuando se derive de los hechos y sin repetir fórmulas vacías.

Redactar normalmente entre 2 y 5 párrafos. El primer párrafo debe comunicar el hecho principal; los siguientes, su alcance, participantes y beneficio. Crear un título informativo, breve y sin punto final, con mayúsculas conforme a la ortografía del español.

## Formato de `news.json`

Agregar una entrada con este esquema:

```json
{
  "id": "slug-unico-en-minusculas",
  "title": "Título institucional de la noticia",
  "imageUrl": "https://raw.githubusercontent.com/aleg001/news_sesc/main/assets/slug-unico-en-minusculas.jpg",
  "content": "<p>Contenido institucional...</p><p>Segundo párrafo...</p>",
  "date": "05/08/2026"
}
```

- Crear `id` como *slug* ASCII descriptivo, único, en minúsculas y separado con guiones. Incluir el año cuando ayude a evitar colisiones.
- Mantener `content` como HTML válido en una sola cadena JSON. Usar principalmente `<p>`, `<strong>` y `<em>`; usar `<a>`, `<br>`, `<ul>` y `<li>` sólo cuando el contenido lo requiera. No usar Markdown.
- Usar `<strong>` con moderación para instituciones, proyectos, cifras o resultados importantes y `<em>` para nombres de programas o citas breves.
- Escapar correctamente comillas y caracteres dentro de JSON.
- Insertar la noticia según su fecha, de la más reciente a la más antigua. No reordenar publicaciones anteriores que no formen parte de la tarea.
- No modificar ni eliminar hechos de publicaciones existentes.

## Imagen

Toda noticia nueva con imagen debe usar una copia local; nunca dejar el vínculo externo original en `imageUrl`.

1. Derivar del `id` un nombre descriptivo y ejecutar:

   ```bash
   ./scripts/import-news-image.sh '<URL_DE_IMAGEN>' '<id>'
   ```

2. Usar en `news.json` la URL de GitHub Raw que imprime el script.
3. Comprobar que el archivo descargado sea realmente una imagen y conservar la extensión determinada por su contenido, no por la URL.
4. No sobrescribir un archivo existente. Si hay una colisión legítima, crear un `id` más específico.

## Validación y publicación

Antes de editar, ejecutar `git status --short` y preservar cualquier cambio previo del usuario. Si ya existen cambios ambiguos en `news.json` o en el mismo archivo de imagen, detenerse antes de publicar y explicarlos; no descartarlos ni incluirlos silenciosamente.

Cuando la entrada y la imagen estén listas, ejecutar directamente:

```bash
./scripts/publish-news.sh 'assets/<archivo-descargado>' '<id>'
```

Este comando valida `news.json`, confirma únicamente la noticia y su imagen, y ejecuta `git push` sobre la rama configurada. No usar `git.sh`, porque agrega indiscriminadamente todos los cambios del repositorio. Si el `push` falla después de crear el commit, resolver el acceso o la red y volver a ejecutar `git push`; no duplicar la entrada ni el commit.

Al finalizar, informar de forma breve el título publicado, la fecha, el archivo de imagen y el commit enviado.

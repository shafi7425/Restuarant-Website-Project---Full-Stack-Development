export function setMeta({ title, description, keywords }) {
    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute('content', description);
    document.querySelector('meta[name="keywords"]').setAttribute('content', keywords);
}

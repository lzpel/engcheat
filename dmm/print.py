import json
import os
import io
import base64
import zipfile

from xhtml2pdf import pisa  # import python module
from xhtml2pdf.files import pisaFileObject
from jinja2 import Environment, FileSystemLoader
import pypdf

# Define your data
source_html = "<html><body><p>To PDF or not to PDF</p></body></html>"
output_filename = "output/test.pdf"


def render_html(**kwargs):
    env = Environment(loader=FileSystemLoader(os.path.join(__file__, "..")), trim_blocks=True)
    template = env.get_template('index.html')
    return template.render(**kwargs)


def render_html2pdf(content):
    with open(output_filename, "w+b") as f:
        fo = io.BytesIO()
        pisa.CreatePDF(
            content,  # the HTML to convert
            dest=fo
        )
        return pypdf.PdfReader(fo)


def merge_pdf(documents, output):
    merger = pypdf.PdfWriter()
    for doc in documents:
        merger.add_page(doc.pages[0])
    merger.write(output)
    merger.close()


def main():
    content = []
    for i in os.scandir(os.path.join(__file__, "..", "paper")):
        if i.is_dir():
            document = None
            audio = None
            for j in os.scandir(i.path):
                if j.is_file():
                    if "json" in j.name:
                        with open(j.path) as f:
                            html = render_html(content=json.load(f)[:2])
                            document = render_html2pdf(html)
                    if any(k in j.name for k in ["mp3", "ogg", "wav"]):
                        audio = j
            if audio and document:
                content.append([i, document, audio])
            else:
                print("error", i.path)
    print(len(content))
    merge_pdf([i[1] for i in content], "output/out.pdf")
    with zipfile.ZipFile(
            'output/out.zip',
            'w',
            compression=zipfile.ZIP_DEFLATED,
            compresslevel=9
    ) as zf:
        for i, v in enumerate(content):
            filename = f'{str(i + 1).zfill(3)}_{v[0].name.split("_")[1]}{os.path.splitext(v[2].name)[1]}'
            zf.write(v[2].path, arcname=filename)


def render_datauri(data, minetype="text/html"):
    return f"data:{minetype};base64, {base64.b64encode(data).decode('ascii')}"


if __name__ == "__main__":
    pisa.showLogging()
    pisaFileObject.getNamedFile = lambda self: self.uri
    main()

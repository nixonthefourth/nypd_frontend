FROM python:3.12
COPY . .
EXPOSE 8000
ENTRYPOINT [ "python3", "-m", "http.server" ]

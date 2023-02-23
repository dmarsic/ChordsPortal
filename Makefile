build:
	podman build -t chords-portal .

run:
	podman run -it -p 5000:5000 chords-portal

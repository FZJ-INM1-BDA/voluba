FROM python:3

# Copy the application folder inside the container
COPY . /backend
WORKDIR /backend

# Install the package and its dependencies
RUN python -m pip install -r ./spatial_alignment_backend/requirements.txt
RUN pip install -e .

# Set environment variables
ENV HOST_ENV 0.0.0.0
ENV PORT_ENV 5000
ENV DEBUG_ENV False
ENV THREADED_ENV True
ENV CORS_ENV True

EXPOSE 5000

# Run the application
ENTRYPOINT ["python","./spatial_alignment_backend/run.py"]

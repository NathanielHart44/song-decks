FROM prom/prometheus
ADD prometheus_local.yml /etc/prometheus/prometheus.yml
CMD ["--web.enable-lifecycle",  "--config.file=/etc/prometheus/prometheus.yml"]
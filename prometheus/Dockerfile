FROM prom/prometheus
ADD prometheus_production.yml /etc/prometheus/prometheus.yml
CMD ["--web.enable-lifecycle",  "--config.file=/etc/prometheus/prometheus.yml"]
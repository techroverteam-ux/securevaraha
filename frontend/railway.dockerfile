FROM mysql:8.0

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=RootPass2024!
ENV MYSQL_DATABASE=varaosrc_hospital_management
ENV MYSQL_USER=varaha_prod
ENV MYSQL_PASSWORD=SecurePass2024!

# Copy database dump
COPY databaseexport.sql /docker-entrypoint-initdb.d/

# Custom MySQL configuration for Railway
RUN echo '[mysqld]' > /etc/mysql/conf.d/railway.cnf && \
    echo 'innodb_use_native_aio=0' >> /etc/mysql/conf.d/railway.cnf && \
    echo 'disable_log_bin' >> /etc/mysql/conf.d/railway.cnf && \
    echo 'performance_schema=0' >> /etc/mysql/conf.d/railway.cnf && \
    echo 'innodb_buffer_pool_size=512M' >> /etc/mysql/conf.d/railway.cnf

EXPOSE 3306

CMD ["mysqld", "--innodb-use-native-aio=0", "--disable-log-bin", "--performance_schema=0", "--innodb-buffer-pool-size=512M"]
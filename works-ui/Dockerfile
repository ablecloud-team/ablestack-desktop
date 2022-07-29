FROM centos:8
MAINTAINER [ablecloud-team] Jin Seong CHOI

RUN cd /etc/yum.repos.d/
RUN sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*
RUN sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*
RUN dnf -y install nginx

COPY ./nginx.conf /etc/nginx/nginx.conf
ADD ./dist/ /usr/share/nginx/html/

EXPOSE 8080
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
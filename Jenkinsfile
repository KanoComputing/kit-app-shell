#!/usr/bin/env groovy

@Library('kanolib') _

pipeline {
    agent {
        docker {
            label 'ubuntu_18.04_with_docker'
            image 'node:8-alpine'
        }
    }
    stages {
        stage('checkout') {
            steps {
                checkout scm
            }
        }
        stage('install dependencies') {
            steps {
                script {
                    sshagent(['read-only-github']) {
                        sh "yarn"
                    }
                }
            }
        }
        stage('checkstyle') {
            steps {
                script {
                    sh "yarn checkstyle-ci"
                }
            }
        }
    }
    post {
        always {
            step([$class: 'CheckStylePublisher', pattern: 'eslint.xml'])
        }
        regression {
            notify_culprits currentBuild.result
        }
    }
}
#!/usr/bin/env groovy

@Library('kanolib') _

pipeline {
    agent {
        docker {
            label 'ubuntu_18.04_with_docker'
            image 'node:8'
        }
    }
    stages {
        stage('checkout') {
            steps {
                sh "mkdir -p ~/.ssh"
                sh "ssh-keyscan -t rsa github.com > ~/.ssh/known_hosts"
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
        stage('test') {
            steps {
                script {
                    sh "yarn test-ci"
                }
            }
        }
    }
    post {
        always {
            junit allowEmptyResults: true, testResults: 'packages/**/test-results.xml'
            step([$class: 'CheckStylePublisher', pattern: 'eslint.xml'])
        }
        regression {
            notify_culprits currentBuild.result
        }
    }
}
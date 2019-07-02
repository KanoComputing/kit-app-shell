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
                    withCredentials([string(credentialsId: 'npm-read-only', variable: 'NPM_TOKEN')]) {
                        sh "echo \"//registry.npmjs.org/:_authToken=${NPM_TOKEN}\" > .npmrc"
                        sshagent(['read-only-github']) {
                            sh "yarn"
                            sh "yarn tsc -b"
                        }
                    }
                }
            }
        }
        stage('test') {
            steps {
                script {
                    sh "yarn lint"
                    sh "yarn test-ci"
                }
            }
        }
    }
    post {
        always {
            junit allowEmptyResults: true, testResults: 'packages/**/test-results.xml'
        }
        regression {
            notify_culprits currentBuild.result
        }
    }
}
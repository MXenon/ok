// Pipeline CI/CD de l'API Node.js (dossier api/).
//  - Toute branche / PR : installation, lint, tests unitaires + intégration, documentation.
//  - Branche main       : déploiement automatique sur AWS Lambda (staging).
//  - Tag vX.Y.Z         : déploiement en production après validation manuelle.
//
// Prérequis sur l'agent : Node.js 22, AWS SAM CLI, AWS CLI, curl.
// Prérequis Jenkins : plugins Pipeline, Git, JUnit, AWS Credentials (+ Cobertura/Coverage, HTML Publisher
// recommandés) et un credential AWS d'identifiant "aws-deploy".
pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '30'))
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    AWS_REGION = 'eu-west-3'
    CI = 'true'
  }

  stages {
    stage('Version') {
      steps {
        script {
          // La version vient de git : tag exact (v1.2.0) ou description (v1.2.0-3-g3f2a9c1).
          sh 'git fetch --tags --force || true'
          env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.APP_VERSION = sh(script: 'git describe --tags --always', returnStdout: true).trim()
          currentBuild.displayName = "#${env.BUILD_NUMBER} ${env.APP_VERSION}"
        }
        echo "Version ${env.APP_VERSION} (commit ${env.GIT_COMMIT_SHORT})"
      }
    }

    stage('Install') {
      steps {
        dir('api') {
          sh 'node --version && npm --version'
          sh 'npm ci'
        }
      }
    }

    stage('Lint') {
      steps {
        dir('api') { sh 'npm run lint' }
      }
    }

    stage('Tests') {
      steps {
        dir('api') { sh 'npm run test:ci' }
      }
      post {
        always {
          junit testResults: 'api/reports/junit.xml', allowEmptyResults: false
          archiveArtifacts artifacts: 'api/reports/coverage/**', allowEmptyArchive: true
        }
      }
    }

    stage('Documentation API') {
      steps {
        dir('api') { sh 'npm run docs' }
        archiveArtifacts artifacts: 'api/docs/**', fingerprint: true
        script {
          // Publication HTML si le plugin "HTML Publisher" est installé.
          try {
            publishHTML(target: [reportDir: 'api/docs', reportFiles: 'index.html', reportName: 'API Docs',
                                 keepAll: true, alwaysLinkToLastBuild: true, allowMissing: false])
          } catch (NoSuchMethodError ignored) {
            echo 'HTML Publisher absent : documentation disponible dans les artefacts du build.'
          }
        }
      }
    }

    stage('Build Lambda') {
      when { anyOf { branch 'main'; buildingTag() } }
      steps {
        dir('api') { sh 'sam validate --lint && sam build' }
      }
    }

    stage('Deploy staging') {
      when { branch 'main' }
      steps {
        deploy('staging')
      }
    }

    stage('Deploy production') {
      when { tag pattern: 'v\\d+\\.\\d+\\.\\d+', comparator: 'REGEXP' }
      steps {
        input message: "Déployer ${env.APP_VERSION} en production ?", ok: 'Déployer'
        deploy('production')
      }
    }
  }

  post {
    success { echo "Pipeline OK pour ${env.APP_VERSION}" }
    failure { echo "Échec du pipeline pour ${env.APP_VERSION}" }
  }
}

def deploy(String stage) {
  withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-deploy']]) {
    dir('api') {
      sh """
        sam deploy --config-env ${stage} --no-progressbar \
          --parameter-overrides Stage=${stage} AppVersion=${env.APP_VERSION} GitCommit=${env.GIT_COMMIT_SHORT}
      """
      def apiUrl = sh(
        script: "aws cloudformation describe-stacks --stack-name tasks-api-${stage} --region ${env.AWS_REGION} " +
                "--query \"Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue\" --output text",
        returnStdout: true
      ).trim()
      echo "API ${stage} : ${apiUrl} — documentation : ${apiUrl}/docs"
      sh "./scripts/smoke-test.sh '${apiUrl}' '${env.APP_VERSION}'"
    }
  }
}

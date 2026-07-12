// Jenkinsfile — mangadex-downloader-gui
// Declarative pipeline สำหรับ Multibranch Pipeline job
// ต้องตั้งค่าใน Jenkins ก่อนใช้งาน:
//   1. Manage Jenkins > System > SonarQube servers
//        - Name: "SonarQube"  (ต้องตรงกับ withSonarQubeEnv ด้านล่าง)
//        - Server URL: URL ของ SonarQube instance ใหม่
//   2. Manage Jenkins > Credentials
//        - เพิ่ม Secret text credential id "sonarqube-token" = SonarQube user token
//   3. Manage Jenkins > Tools
//        - เพิ่ม "SonarQube Scanner" tool ชื่อ "SonarScanner" (ติดตั้งผ่าน SonarQube Scanner plugin)
//   4. Jenkins agent/node ที่รันงานนี้ต้องมี: Node.js 20+, pnpm, Rust toolchain (cargo, clippy component)
//        rustup component add clippy

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        // ต้องตรงกับชื่อ SonarQube server ที่ตั้งใน Manage Jenkins > System
        SONARQUBE_ENV = 'SonarQube'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install deps (frontend)') {
            steps {
                sh '''
                    corepack enable || true
                    corepack prepare pnpm@9.15.0 --activate
                    pnpm install --frozen-lockfile
                '''
            }
        }

        stage('Typecheck & Build (frontend)') {
            steps {
                sh 'pnpm run build'
            }
        }

        stage('Clippy (Rust)') {
            steps {
                dir('src-tauri') {
                    sh '''
                        rustup component add clippy 2>/dev/null || true
                        cargo clippy --message-format=json --all-targets > ../clippy-report.json || true
                    '''
                }
            }
        }

        stage('Convert clippy report for Sonar') {
            steps {
                sh 'node scripts/clippy-to-sonar.cjs clippy-report.json clippy-sonar-report.json'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            SCANNER_HOME=$(readlink -f "$(which sonar-scanner)" | xargs dirname | xargs dirname 2>/dev/null || echo "")
                            sonar-scanner \
                                -Dsonar.token=${SONAR_TOKEN} \
                                -Dsonar.projectVersion=${BUILD_NUMBER}
                        '''
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                // รอผล Quality Gate จาก SonarQube (ต้องตั้งค่า webhook ใน SonarQube ชี้กลับมาที่ Jenkins ด้วย:
                // Administration > Configuration > Webhooks > <jenkins-url>/sonarqube-webhook/)
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'clippy-report.json,clippy-sonar-report.json', allowEmptyArchive: true
        }
    }
}

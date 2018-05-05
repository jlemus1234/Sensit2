#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
// Constants -- WiFi
const char* ssid = "Tufts_Guest";
const char* password = "";
const char* urlPost = "https://sensitbme.herokuapp.com/submit";
const char* data = "POST {'username': 'jalo'}";
int port = 80;
const char* host = "http://sensitbme.herokuapp.com";



int status = WL_IDLE_STATUS;
WiFiClient client;

// Constants -- Sensor
const int backSensor = 13;     // D7
const int bottomSensor = 15;  // D8
const int sensorPin = A0; //pin A0 to read analog input 
const int ledPin = 5; // D1
const int buzzerPin = 4; //D2
// Variables -- Alarm
int value = 0; //save analog value
int backValue = 0;
int bottomValue = 0;
char dataString[50] = {0};
int timer = 0;

// Variables -- Changes
int prev = -1;
int backPrev = -1;
//int cur = -1;
int threshold = 40;


void setup() {
  // WiFi
  Serial.begin(9600);       //Begin serial communication
  delay(10);
 
  // Connect to WiFi network
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
 
  status = WiFi.begin(ssid, NULL);
  WiFi.begin();
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  //HTTPClient http;
  //http.begin("http://sensitbme.herokuapp.com/submit");
  //http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  //http.POST("{\'username\':\'jalo\'}");
  //http.writeToStream(&Serial);
  //http.end();
  
  // Sensors
  pinMode(backSensor, OUTPUT);
  pinMode(bottomSensor, OUTPUT);  //Set pin 3 as 'output' 
  digitalWrite(backSensor, LOW);
  digitalWrite(bottomSensor, LOW);
  digitalWrite(ledPin, LOW);
  digitalWrite(buzzerPin, LOW);
}

void loop() {
  // put your main code here, to run repeatedly:
   // digitalWrite(ledPin, HIGH);
  digitalWrite(backSensor, LOW);
  digitalWrite(bottomSensor, LOW);

  digitalWrite(backSensor, HIGH);
  value = analogRead(sensorPin);       //Read and save analog value from potentiometer
  backValue = value;
  //sprintf(dataString,"%02X", value); // convert a value to hexa 
  //sprintf(dataString,"%i", value);
  Serial.println(value);               //Print value

  //Serial.println(dataString);
  value = map(value, 0, 1023, 0, 255); //Map value 0-1023 to 0-255 (PWM)
  analogWrite(ledPin, value);          //Send PWM value to led

  delay(100);                         //Small delay

  digitalWrite(backSensor, LOW);
  digitalWrite(bottomSensor, HIGH);
  value = analogRead(sensorPin);
  bottomValue = value;
  Serial.println(value);
  value = map(value, 0, 1023, 0, 255);
  analogWrite(ledPin, value);
  delay(100);

  if(backValue > threshold && bottomValue > threshold){
    Serial.println("Sitting correctly\n");
    analogWrite(buzzerPin, LOW);
    timer = 0;
    if(backPrev == 1){
      HTTPClient http;
      http.begin("http://sensitbme.herokuapp.com/enviar");
      http.addHeader("Content-Type", "application/x-www-form-urlencoded");
      http.POST("username=jalo");
      http.end();
    }
    backPrev = -1;


      
  }else if(backValue < threshold && bottomValue > threshold){
    Serial.println("Sitting incorrectly");
    Serial.print("Timer:");
    Serial.println(timer);
    if(timer > 3000){
    analogWrite(buzzerPin, HIGH);
    }else{
      timer += 100;
    }

    if(backPrev != 1){
    HTTPClient http;
    http.begin("http://sensitbme.herokuapp.com/enviar");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    http.POST("username=jalo");
    http.end();
    }
    
    backPrev = 1;
    
  }else{
    if(backPrev == 1){
      HTTPClient http;
      http.begin("http://sensitbme.herokuapp.com/enviar");
      http.addHeader("Content-Type", "application/x-www-form-urlencoded");
      http.POST("username=jalo");
      http.end();
    }
    backPrev = -1;
    Serial.println("Not sitting\n");
    analogWrite(buzzerPin, LOW);
    timer = 0;
  }

  if(bottomValue < 10 and prev == -1){
    Serial.println("You are not sitting on the sensor and just booted up");
    prev = bottomValue;
  }else if(bottomValue > threshold and prev == -1){
    Serial.println("You are sitting on the sensor and just booted up");
    prev = bottomValue;
    // Post to server
    HTTPClient http;
    http.begin("http://sensitbme.herokuapp.com/submit");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    http.POST("username=jalo");
    http.end();
  }else if(bottomValue > threshold and prev < threshold){
    Serial.println("You are sitting on the sensor but weren't before");
    prev = bottomValue;
    HTTPClient http;
    http.begin("http://sensitbme.herokuapp.com/submit");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    http.POST("username=jalo");
    http.end();
  }else if(bottomValue < threshold and prev > threshold){
    Serial.println("You are not sitting on the sensor but were before\n");
    prev = bottomValue;
    HTTPClient http;
    http.begin("http://sensitbme.herokuapp.com/submit");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    http.POST("username=jalo");
    http.end();
  }else{
    Serial.println("No state change");
  }
  }







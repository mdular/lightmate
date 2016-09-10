/**
 * AT commands:
 * 
 * AT
 * response: OK
 * 
 * AT+VERSION
 * response: version
 * 
 * AT+PIN0000
 * response: OKsetPIN
 * 
 * AT+NAMEsomename
 * response: OKsetname
 * 
 * AT+BAUD7
 * response: OK57600
 */


#include <SoftwareSerial.h>

int txPin = 5;
int rxPin = 2;
int timeoutThreshold = 1000; // how many loops we will hold before sending the message, since there is no delimiter
String outMessage = "";

SoftwareSerial ATSerial(rxPin, txPin); // RX, TX

void setup() {
  
//  int powerPin = 11;
  long baudRate = 9600;

  // establish Arduino <> Computer serial connection
  Serial.begin(9600);

  // power up the bluetooth module
//  pinMode(powerPin, OUTPUT);
//  digitalWrite(powerPin, HIGH);
  delay(500);

  // establish bluetooth serial connection via softwareserial
  ATSerial.begin(baudRate);

  Serial.println("Enter AT commands:");
}

int messageTimeout = -1;

void loop() {
  while (Serial.available()) {
    ATSerial.print(char(Serial.read()));
  }

  while (ATSerial.available()) {
    byte inByte = ATSerial.read();
    outMessage += char(inByte);
    messageTimeout = 0;
  }
  if (!ATSerial.available()) {
    if (messageTimeout > timeoutThreshold && outMessage != "") {
      Serial.println(outMessage);
      ATSerial.println(outMessage);
      outMessage = "";
      messageTimeout = -1;
    } else if (messageTimeout >= 0) {
      messageTimeout++;
    }
  }

  
}


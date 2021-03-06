CREATE TABLE bet (
id INT NOT NULL AUTO_INCREMENT,
description VARCHAR(255) NOT NULL,
active TINYINT DEFAULT 1 NOT NULL,
primary key (id)
);

CREATE TABLE `option` (
id INT NOT NULL AUTO_INCREMENT,
description VARCHAR(255) NOT NULL,
betId INT NOT NULL,
primary key (id),
FOREIGN KEY (betId) REFERENCES bet(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE user (
  id INT NOT NULL AUTO_INCREMENT,
  discordId VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  money INT NOT NULL DEFAULT 100,
  primary key (id)
);

ALTER TABLE
  bet
ADD
  userId int NOT NULL;

ALTER TABLE
  bet
ADD
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE userBet (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  betId INT NOT NULL,
  optionId INT NOT NULL,
  money INT NOT NULL,
  winnings INT DEFAULT null,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (betId) REFERENCES bet(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (optionId) REFERENCES `option`(id) ON DELETE CASCADE ON UPDATE CASCADE,
  primary key (id)
);


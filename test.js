var cv = require('opencv');


var trainingData = [];
for (var j = 1; j<10; j++){
  trainingData.push([j,"./assets/images/makoto_at_cornell_dot_edu/c24d764e75ca5b5e6e4cb47ab5c69c3f80d315ef.pgm" ]);
  trainingData.push([j,"./assets/images/makoto_at_cornell_dot_edu/c24d764e75ca5b5e6e4cb47ab5c69c3f80d315ef.pgm" ]);
}

var eigenFaceRecognizer = cv.FaceRecognizer.createEigenFaceRecognizer();
eigenFaceRecognizer.trainSync(trainingData);
eigenFaceRecognizer.saveSync("Here.xml");
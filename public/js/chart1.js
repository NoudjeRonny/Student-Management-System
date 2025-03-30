const ctx = document.getElementById('lineChart');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'March', 'April', 'May', 'June','July','August',"Sep",'Oct','Nov','Dec'],
      datasets: [{
        label: 'Students Performance',
        data: [20, 40,80,60, 75, 45,0,0,70,72,35,95],
        backgroundColor:[
        'rgba(85,85,85,1)'
        ],
        borderColor:[
            'rgb(41,155,990)'
        ],

        borderWidth: 1
      }]
    },
    options: {
        responsive: true
    //   scales: {
    //     y: {
    //       beginAtZero: true
    //     }
    //   }
    }
  });
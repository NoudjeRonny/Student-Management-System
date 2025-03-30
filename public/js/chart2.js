const cty = document.getElementById('doughnut');
  new Chart(cty, {
    type: 'doughnut',
    data: {
      labels: [ 'Student',  'Administration', 'Others',],
      datasets: [{
        label: 'Users',
        data: [42,12,8,6],
        backgroundColor:[
        'rgba(41,155,99,1)',
        'rgba(54,162,235,1)',
        'rgba(255,206,86,1)',

        ],
        borderColor:[
            'rgba(41,155,99,1)',
            'rgba(54,162,235,1)',
            'rgba(255,206,86,1)',
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
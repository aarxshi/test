/**
 * floors-data.js — floor plan data, keyed by building id
 *
 * FLOOR_DATA[bid] existing is what makes selectBuilding() show a
 * "View Floors" button for that building — buildings with no entry here
 * just don't get the button. Add more buildings by adding more keys.
 *
 * This is the schema the real backend's /api/floors/:buildingId will
 * eventually return — swapping the data source later is a fetch() call
 * in floors.js, not a rewrite of the rendering logic.
 *
 * The traced room polygons are approximate (good enough to click
 * accurately, not CAD-precision)
 */

const FLOOR_DATA = {
  '4': {
    alias: 'NEB',
    depts: ['Civil Engineering', 'Computer Science & Business Systems', 'Aeronautical Engineering',
            'Computer Science & Data Science', 'Management Studies', 'Mathematics'],
    deptColors: {
      'Civil Engineering':                     '#0ea5e9',
      'Computer Science and Business Systems': '#8b5cf6',
      'Aeronautical Engineering':              '#16a34a',
      'Computer Science and Data Science':     '#ca8a04',
      'Management Studies':                    '#dc2626',
      'Mathematics':                           '#0d9488',
      'Unassigned':                            '#b0aa9f',
      'Chemical Engineering':                  '#8b5cf6',
      'IEDC':                                  '#ca8a04',
      'Automobile Engineering':                '#16a34a',
      'ERP': '#8b5cf6',
    },
    floors: [
      {
        floor: 0, label: 'Ground Floor', digitized: true,
        backgroundImage: 'floorplans/4/floor0-neb.png',
        imageWidth: 532, imageHeight: 535,
        rooms: [
        { id: '2', roomNumber: 'AE-002', newRoomNumber: 'AE-LAB2', name: 'AE-LAB2', type: 'Lab', assignable: true, department: 'Aeronautical Engineering', usedFor: 'AERO-LAB-2', remarks: 'AIRCRAFT PROPULTION LAB',
          points: [[[97,45],[436,45],[436,118],[97,118]],[[116,117],[436,117],[436,169],[116,169]]] },
        { id: '1', roomNumber: 'AE-001', newRoomNumber: 'AE-LAB1', name: 'AE-LAB1', type: 'Lab', assignable: true, department: 'Aeronautical Engineering', usedFor: 'AERO-LAB-1', remarks: 'FLUID MECHANICS LAB',
          points: [[30,183],[114,183],[114,427],[30,427]] },
        { id: '5', roomNumber: 'AE-104', newRoomNumber: 'AE-UPS', name: 'AE-UPS', type: 'Facilities', assignable: false, department: null, usedFor: 'UPS/PANEL ROOM', remarks: 'USED BY FACILITIES',
          points: [[361,175],[438,175],[438,203],[361,203]] },
        { id: '7', roomNumber: '001B', newRoomNumber: 'R&D CENTRE', name: 'R&D CENTRE', type: 'R&D', assignable: true, department: 'Aeronautical Engineering', usedFor: 'AERO-R&D CENTRE',
          points: [[31,46],[94,46],[94,135],[31,135]] },
        { id: '6', roomNumber: '001A', newRoomNumber: 'LAB', name: 'LAB', type: 'Lab', assignable: true, department: 'Aeronautical Engineering', usedFor: 'PROJECT LAB',
          points: [[30,137],[111,137],[111,180],[30,180]] },
        { id: '3', roomNumber: 'AE-003', newRoomNumber: 'AE-LAB3', name: 'AE-LAB3', type: 'Lab', assignable: true, department: 'Aeronautical Engineering', usedFor: 'AERO-LAB-3', remarks: 'AERODYNAMICS LAB',
          points: [[362,208],[438,208],[438,282],[362,282]] },
        { id: '4', roomNumber: 'AE-004', newRoomNumber: 'AE-LAB-4', name: 'AE-LAB-4', type: 'Lab', assignable: true, department: 'Aeronautical Engineering', usedFor: 'AERO-LAB-4', remarks: 'ENERGY CONVERSION LAB',
          points: [[328,282],[439,282],[439,429],[328,429]] }
        ]
      },
     
      {
        floor: 1, label: '1st Floor', digitized: true,
        backgroundImage: 'floorplans/4/floor1-neb.png',
        //imageWidth: 523, imageHeight: 536,
        rooms: [
        { id: '8', roomNumber: 'CSBS-103', newRoomNumber: 'CSBS-CR1', name: 'CSBS-CR1', type: 'Classroom', assignable: true, department: 'Computer Science and Business Systems', usedFor: 'CLASSROOM',
          points: [[34,54],[126,54],[126,173],[34,173]] },
        { id: '9', roomNumber: 'CHEMICAL-104', newRoomNumber: 'CH-CR2', name: 'CH-CR2', type: 'Classroom', assignable: true, department: 'Chemical Engineering', usedFor: 'CLASSROOM',
          points: [[132,55],[248,55],[248,195],[132,195]] },
        { id: '10', roomNumber: 'CSDS-105', newRoomNumber: 'CSDS-CR3', name: 'CSDS-CR3', type: 'Classroom', assignable: true, department: 'Computer Science and Data Science', usedFor: 'CLASSROOM',
          points: [[254,55],[371,55],[371,195],[254,195]] },
        { id: '11', roomNumber: 'CSBS-106', newRoomNumber: 'CSBS-CR2', name: 'CSBS-CR2', type: 'Classroom', assignable: true, department: 'Computer Science and Business Systems', usedFor: 'CLASSROOM',
          points: [[374,55],[498,55],[498,195],[374,195]] },
        { id: '12', roomNumber: 'HoD 107', newRoomNumber: 'VACANT', name: '107', type: 'HoD Room', assignable: true, department: 'Unassigned', usedFor: 'HoD ROOM', remarks: 'VACANT',
          points: [[[408,197],[496,197],[496,236],[408,236]],[[451,232],[496,232],[496,256],[451,256]]] },
        { id: '13', roomNumber: '108', newRoomNumber: 'RESTROOM', name: 'RESTROOM', type: 'Facilities', assignable: false, department: null, usedFor: 'RESTROOMS',
          points: [[[410,238],[450,238],[450,317],[410,317]],[[445,260],[494,260],[494,317],[445,317]]] },
        { id: '7', roomNumber: 'MBA-102', newRoomNumber: 'MBA-CR3', name: 'MBA-CR3', type: 'Classroom', assignable: true, department: 'Management Studies', usedFor: 'CLASSROOM',
          points: [[[13,176],[97,176],[97,233],[13,233]],[[37,227],[97,227],[97,301],[37,301]]] },
        { id: '6', roomNumber: 'CHEMICAL-101', newRoomNumber: 'CH-CR1', name: 'CH-CR1', type: 'Classroom', assignable: true, department: 'Chemical Engineering', usedFor: 'CLASSROOM',
          points: [[35,303],[126,303],[126,490],[35,490]] },
        { id: '14', roomNumber: 'CHEMISTRY-109', newRoomNumber: 'CHE-R&D', name: 'CHE-R&D', type: 'R&D', assignable: true, department: 'Chemical Engineering', usedFor: 'R&D CENTRE',
          points: [[253,429],[310,429],[310,487],[253,487]] },
        { id: '15', roomNumber: 'M-110', newRoomNumber: 'MATHS-SR', name: 'MATHS-SR', type: 'Staff Room', assignable: true, department: 'Mathematics', usedFor: 'FACULTY ROOM',
          points: [[372,361],[495,361],[495,487],[372,487]] }
        ]
      },

      {
        floor: 2, label: '2nd Floor', digitized: true,
        backgroundImage: 'floorplans/4/floor2-neb.png',
        //imageWidth: 523, imageHeight: 518,
        rooms: [
        { id: '19', roomNumber: 'CSDS-203', newRoomNumber: 'CSDS-CR1', name: 'CSDS-CR1', type: 'Classroom', assignable: true, department: 'Computer Science and Data Science', usedFor: 'CLASSROOM',
          points: [[33,45],[125,45],[125,163],[33,163]] },
        { id: '20', roomNumber: 'CSDS-204', newRoomNumber: 'CSDS-CR2', name: 'CSDS-CR2', type: 'Classroom', assignable: true, department: 'Computer Science and Data Science', usedFor: 'CLASSROOM',
          points: [[127,44],[244,44],[244,182],[127,182]] },
        { id: '21', roomNumber: 'CSDS-205', newRoomNumber: 'CSDS-LAB 1/2', name: 'CSDS-LAB 1/2', type: 'Lab', assignable: true, department: 'Computer Science and Data Science', usedFor: 'CSDS-LAB 1/2',
          points: [[248,46],[363,46],[363,184],[248,184]] },
        { id: '22', roomNumber: 'CSDS-206', newRoomNumber: 'CSDS-LAB 3/4', name: 'CSDS-LAB 3/4', type: 'Lab', assignable: true, department: 'Computer Science and Data Science', usedFor: 'CSDS-LAB 3/4',
          points: [[367,46],[485,46],[485,183],[367,183]] },
        { id: '23', roomNumber: 'CSDS-207', newRoomNumber: 'CSDS-HoD', name: 'CSDS-HoD', type: 'HoD ROOM', assignable: true, department: 'Computer Science and Data Science', usedFor: 'HoD ROOM',
          points: [[[401,187],[486,187],[486,223],[401,223]],[[444,219],[486,219],[486,246],[444,246]]] },
        { id: '24', roomNumber: 'CSDS-208', newRoomNumber: 'RESTROOM', name: 'RESTROOM', type: 'Facilities', assignable: false, department: null,
          points: [[[401,226],[440,226],[440,305],[401,305]],[[434,248],[486,248],[486,305],[434,305]]] },
        { id: '17', roomNumber: 'CSDS FY-201', newRoomNumber: 'CSDS-FY-CR', name: 'CSDS-FY-CR', type: 'Classroom', assignable: true, department: 'Computer Science and Data Science', usedFor: 'FIRST YEAR CSDS CLASSROOM',
          points: [[33,291],[123,291],[123,473],[33,473]] },
        { id: '18', roomNumber: 'CSDS-202', newRoomNumber: 'CSDS-TUT', name: 'CSDS-TUT', type: 'Classroom', assignable: true, department: 'Computer Science and Data Science', usedFor: 'CSDS TUTORIAL ROOM',
          points: [[[12,167],[96,167],[96,221],[12,221]],[[34,205],[96,205],[96,288],[34,288]]] },
        { id: '25', roomNumber: 'CSDS-209', newRoomNumber: 'CSDS-SR', name: 'CSDS-SR', type: 'Staff Room', assignable: true, department: 'Computer Science and Data Science', usedFor: 'FACULTY ROOM',
          points: [[248,413],[306,413],[306,472],[248,472]] },
        { id: '26', roomNumber: 'CSDS-210', newRoomNumber: 'CSDS-OFF', name: 'CSDS-OFF', type: 'Office', assignable: true, department: 'Computer Science and Data Science', usedFor: 'DEPT. OFFICE ROOM',
          points: [[364,348],[486,348],[486,473],[364,473]] }
        ],
      }, 
      {
        floor: 3, label: '3rd Floor', digitized: true,
        backgroundImage: 'floorplans/4/floor3-neb.png',
        //imageWidth: 587, imageHeight: 569,
        rooms: [
        { id: '26', roomNumber: 'FY-301', newRoomNumber: 'FY-CR', name: 'FY-CR', type: 'Classroom', assignable: true, department: 'Civil Engineering', usedFor: 'CLASSROOM',
          points: [[36,321],[139,321],[139,525],[36,525]] },
        { id: '27', roomNumber: 'EDP-302', newRoomNumber: 'EDP-302', name: 'EDP-302', type: 'Office', assignable: true, department: 'ERP', usedFor: 'OFFICE ROOM', remarks: 'ERP OFFICE STAFF',
          points: [[[12,179],[106,179],[106,239],[12,239]],[[36,231],[107,231],[107,315],[36,315]]] },
        { id: '28', roomNumber: 'CVL-303', newRoomNumber: 'CVL-CR1', name: 'CVL-CR1', type: 'Classroom', assignable: true, department: 'Civil Engineering', usedFor: 'CLASSROOM',
          points: [[37,41],[138,41],[138,174],[37,174]] },
        { id: '29', roomNumber: 'CVL-304', newRoomNumber: 'CVL-CR2', name: 'CVL-CR2', type: 'Classroom', assignable: true, department: 'Civil Engineering', usedFor: 'CLASSROOM',
          points: [[143,41],[276,41],[276,197],[143,197]] },
        { id: '30', roomNumber: 'CVL-305', newRoomNumber: 'CVL-CR3', name: 'CVL-CR3', type: 'Classroom', assignable: true, department: 'Civil Engineering', usedFor: 'CLASSROOM',
          points: [[280,39],[412,39],[412,199],[280,199]] },
        { id: '31', roomNumber: 'CVL-306', newRoomNumber: 'CVL-CR4', name: 'CVL-CR4', type: 'Classroom', assignable: true, department: 'Civil Engineering', usedFor: 'CLASSROOM',
          points: [[418,40],[552,40],[552,197],[418,197]] },
        { id: '32', roomNumber: 'MATHS-307', newRoomNumber: 'MATHS-307', name: 'MATHS-307', type: 'HoD ROOM', assignable: true, department: 'Mathematics', usedFor: 'HoD ROOM', remarks: 'MATHS-HoD/OFF',
          points: [[[456,201],[552,201],[552,244],[456,244]],[[501,237],[551,237],[551,267],[501,267]]] },
        { id: '33', roomNumber: '308', newRoomNumber: 'RESTROOM', name: 'RESTROOM', type: 'Facilities', assignable: false, department: null, usedFor: 'RESTROOM',
          points: [[[454,245],[497,245],[497,335],[454,335]],[[490,270],[550,270],[550,336],[490,336]]] },
        { id: '34', roomNumber: 'MATHS-309', newRoomNumber: 'MATHS-SR', name: 'MATHS-SR', type: 'Staff Room', assignable: true, department: 'Mathematics', usedFor: 'FACULTY ROOM', remarks: 'MATHS STAFF ROOM',
          points: [[415,384],[550,384],[550,527],[415,527]] },
        { id: '35', roomNumber: 'MATHS-310', newRoomNumber: 'MATHS-SR', name: 'MATHS-SR', type: 'Staff Room', assignable: true, department: 'Mathematics', usedFor: 'MATHS STAFF ROOM',
          points: [[280,459],[346,459],[346,525],[280,525]] }
        ]
      },
    
      {
        floor: 4, label: '4th Floor', digitized: true,
        backgroundImage: 'floorplans/4/floor4-neb.png',
        //imageWidth: 581, imageHeight: 590,
        rooms: [
        { id: '35', roomNumber: 'AE-401', newRoomNumber: 'AE-CR1', name: 'AE-CR1', type: 'Classroom', assignable: true, department: 'Aeronautical Engineering', usedFor: 'CLASSROOM',
          points: [[38,325],[141,325],[141,531],[38,531]] },
        { id: '36', roomNumber: 'AE-402', newRoomNumber: 'AE-TUT', name: 'AE-TUT', type: 'Classroom', assignable: true, department: 'Aeronautical Engineering', usedFor: 'TUTORIAL ROOM',
          points: [[[14,185],[106,185],[106,247],[14,247]],[[38,239],[105,239],[105,323],[38,323]]] },
        { id: '37', roomNumber: 'AE-403', newRoomNumber: 'AE-LAB5', name: 'AE-LAB5', type: 'Lab', assignable: true, department: 'Aeronautical Engineering', usedFor: 'UAV/STRUCTURES/LAB',
          points: [[38,51],[138,51],[138,181],[38,181]] },
        { id: '38', roomNumber: 'AE-404', newRoomNumber: 'AE-CR2', name: 'AE-CR2', type: 'Classroom', assignable: true, department: 'Aeronautical Engineering', usedFor: 'CLASSROOM',
          points: [[144,50],[276,50],[276,207],[144,207]] },
        { id: '39', roomNumber: 'AE-405', newRoomNumber: 'AE-LAB6', name: 'AE-LAB6', type: 'Lab', assignable: true, department: 'Aeronautical Engineering', usedFor: 'AERO-COMPUTER LAB',
          points: [[279,50],[411,50],[411,207],[279,207]] },
        { id: '40', roomNumber: 'AE-406', newRoomNumber: 'AE-CR3', name: 'AE-CR3', type: 'Classroom', assignable: true, department: 'Aeronautical Engineering', usedFor: 'CLASSROOM',
          points: [[415,48],[548,48],[548,205],[415,205]] },
        { id: '41', roomNumber: 'AE-407', newRoomNumber: 'AE-HoD', name: 'AE-HoD', type: 'HoD ROOM', assignable: true, department: 'Aeronautical Engineering', usedFor: 'HoD ROOM',
          points: [[[453,209],[549,209],[549,251],[453,251]],[[500,245],[549,245],[549,275],[500,275]]] },
        { id: '42', roomNumber: 'AE-408', newRoomNumber: 'RESTROOM', name: 'RESTROOM', type: 'Facilities', assignable: false, department: null,
          points: [[[453,253],[499,253],[499,342],[453,342]],[[489,277],[548,277],[548,343],[489,343]]] },
        { id: '43', roomNumber: 'AE-409', newRoomNumber: 'AE-SR', name: 'AE-SR', type: 'Staff Room', assignable: true, department: 'Aeronautical Engineering', usedFor: 'FACULTY ROOM',
          points: [[411,391],[548,391],[548,533],[411,533]] },
        { id: '44', roomNumber: 'AE-410', newRoomNumber: 'AE-OFFICE', name: 'AE-OFFICE', type: 'Office', assignable: true, department: 'Aeronautical Engineering', usedFor: 'DEPT. ROOM',
          points: [[278,465],[346,465],[346,532],[278,532]] }
        ]

      },

      {
        floor: 5, label: '5th Floor', digitized: true,
        backgroundImage: 'floorplans/4/floor5-neb.png',
        //imageWidth: 495, imageHeight: 459,
        rooms: [
        { id: '44', roomNumber: 'AE-501', newRoomNumber: 'AE-LAB7', name: 'AE-LAB7', type: 'Lab', assignable: true, department: 'Aeronautical Engineering', usedFor: 'RESEARCH & INNOVATION LAB', remarks: 'AERO-X-CAT-LAB',
          points: [[29,252],[117,252],[117,427],[29,427]] },
        { id: '45', roomNumber: 'CVL-502', newRoomNumber: 'CVL-PGCR1', name: 'CVL-PGCR1', type: 'Classroom', assignable: true, department: 'Civil Engineering', usedFor: 'PG CLASSROOM', remarks: 'CVL-PG',
          points: [[[9,130],[90,130],[90,185],[9,185]],[[31,178],[88,178],[88,248],[31,248]]] },
        { id: '46', roomNumber: 'AU-503', newRoomNumber: 'AU-503', name: 'AU-503', type: 'Lab', assignable: true, department: 'Automobile Engineering', usedFor: 'MODELLING & SIMULATION LAB', remarks: 'SHIFTED TO AUTO BLOCK',
          points: [[29,15],[116,15],[116,127],[29,127]] },
        { id: '47', roomNumber: 'CVL-504', newRoomNumber: 'CVL-LAB1', name: 'CVL-LAB1', type: 'Lab', assignable: true, department: 'Civil Engineering', usedFor: 'LAB', remarks: 'CVL-CAD-LAB',
          points: [[120,16],[232,16],[232,148],[120,148]] },
        { id: '48', roomNumber: 'IEDC-505', newRoomNumber: 'IEDC', name: 'IEDC', type: 'Office', assignable: true, department: 'IEDC', usedFor: 'IEDC CENTRE',
          points: [[236,16],[347,16],[347,147],[236,147]] },
        { id: '49', roomNumber: 'CSBS-506', newRoomNumber: 'CSBS-LAB1/2', name: 'CSBS-LAB1/2', type: 'Lab', assignable: true, department: 'Computer Science and Business Systems', usedFor: 'LAB',
          points: [[351,15],[467,15],[467,149],[351,149]] },
        { id: '50', roomNumber: 'CSBS-507', newRoomNumber: 'CSBS-HoD', name: 'CSBS-HoD', type: 'HoD ROOM', assignable: true, department: 'Computer Science and Business Systems', usedFor: 'HoD ROOM',
          points: [[[384,153],[467,153],[467,185],[384,185]],[[423,181],[467,181],[467,207],[423,207]]] },
        { id: '51', roomNumber: 'CVL-508', newRoomNumber: 'RESTROOM', name: 'RESTROOM', type: 'Facilities', assignable: false, department: null,
          points: [[[384,187],[420,187],[420,265],[384,265]],[[413,210],[466,210],[466,267],[413,267]]] },
        { id: '52', roomNumber: 'CVL-509', newRoomNumber: 'CVL-SR', name: 'CVL-SR', type: 'Staff Room', assignable: true, department: 'Civil Engineering', usedFor: 'FACULTY ROOM',
          points: [[348,307],[466,307],[466,428],[348,428]] },
        { id: '53', roomNumber: 'CVL-510', newRoomNumber: 'CVL-SR', name: 'CVL-SR', type: 'Staff Room', assignable: true, department: 'Civil Engineering', usedFor: 'FACULTY ROOM',
          points: [[234,369],[292,369],[292,428],[234,428]] }
        ]
      },
    
      {
        floor: 6, label: '6th Floor', digitized: true,
        backgroundImage: 'floorplans/4/floor6-neb.png',
        //imageWidth: 513, imageHeight: 504,
        rooms: [
        { id: '53', roomNumber: 'CVL-601', newRoomNumber: 'CVL-CR5', name: 'CVL-CR5', type: 'Classroom', assignable: true, department: 'Civil Engineering', usedFor: 'CLASSROOM',
          points: [[34,285],[126,285],[126,471],[34,471]] },
        { id: '54', roomNumber: 'CVL-602', newRoomNumber: 'CVL-PGCR2', name: 'CVL-PGCR2', type: 'Classroom', assignable: true, department: 'Civil Engineering', usedFor: 'PG CLASSROOM',
          points: [[[14,159],[97,159],[97,214],[14,214]],[[36,210],[97,210],[97,284],[36,284]]] },
        { id: '55', roomNumber: 'CVL-603', newRoomNumber: 'CVL-LIB', name: 'CVL-LIB', type: 'LIBRARY', assignable: true, department: 'Civil Engineering', usedFor: 'LIBRARY',
          points: [[34,38],[125,38],[125,156],[34,156]] },
        { id: '56', roomNumber: 'CVL-604', newRoomNumber: 'CVL-CR6', name: 'CVL-CR6', type: 'Classroom', assignable: true, department: 'Civil Engineering', usedFor: 'CLASSROOM',
          points: [[129,37],[247,37],[247,179],[129,179]] },
        { id: '57', roomNumber: 'CSECY-605', newRoomNumber: 'CSBS-LAB3/4', name: 'CSBS-LAB3/4', type: 'Lab', assignable: true, department: 'Computer Science and Business Systems', usedFor: 'CSBS-LAB3/4',
          points: [[250,37],[369,37],[369,177],[250,177]] },
        { id: '58', roomNumber: 'CVL-606', newRoomNumber: 'CVL-SR', name: 'CVL-SR', type: 'Staff Room', assignable: true, department: 'Civil Engineering', usedFor: 'FACULTY ROOM',
          points: [[372,39],[490,39],[490,177],[372,177]] },
        { id: '59', roomNumber: 'CVL-607', newRoomNumber: 'CVL-HoD', name: 'CVL-HoD', type: 'HoD ROOM', assignable: true, department: 'Civil Engineering', usedFor: 'HoD ROOM',
          points: [[[407,183],[490,183],[490,219],[407,219]],[[448,211],[490,211],[490,238],[448,238]]] },
        { id: '60', roomNumber: 'CVL-608', newRoomNumber: 'RESTROOM', name: 'RESTROOM', type: 'Facilities', assignable: false, department: null,
          points: [[[406,220],[445,220],[445,299],[406,299]],[[438,240],[490,240],[490,301],[438,301]]] },
        { id: '62', roomNumber: 'CVL-610', newRoomNumber: 'CVL-OFF', name: 'CVL-OFF', type: 'Office', assignable: true, department: 'Civil Engineering', usedFor: 'OFFICE ROOM',
          points: [[252,407],[310,407],[310,469],[252,469]] },
        { id: '61', roomNumber: 'CVL-609', newRoomNumber: 'CVL-SR', name: 'CVL-SR', type: 'Staff Room', assignable: true, department: 'Civil Engineering', usedFor: 'FACULTY ROOM',
          points: [[368,343],[491,343],[491,471],[368,471]] }
        ]
      },
    ],
  },
};
